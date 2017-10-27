package com.obduratereptile.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.InputMultiplexer;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.graphics.glutils.FrameBuffer;
import com.badlogic.gdx.graphics.glutils.ShaderProgram;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Button;
import com.badlogic.gdx.scenes.scene2d.utils.ClickListener;
import com.badlogic.gdx.utils.viewport.FitViewport;

import static com.badlogic.gdx.graphics.Pixmap.Format.RGBA8888;

/**
 * Created by Marc on 10/24/2017.
 */

public class Lesson5Screen implements Screen {
    public ShaderLessons game;

    public Texture tex;
//    public Texture tex2;
    public ShaderProgram shader;
    public FrameBuffer blurTargetA, blurTargetB;
    public TextureRegion fboRegion;
    public SpriteBatch batchL5;

    public static final int FBO_SIZE = 1024;
    public static final float MAX_BLUR = 2f;

    public OrthographicCamera cam;
    public InputMultiplexer inputControllerMultiplexer;
    public Stage stage;

    public Lesson5Screen(final ShaderLessons game) {
        this.game = game;

        stage = new Stage(new FitViewport(ShaderLessons.SCREENSIZEX, ShaderLessons.SCREENSIZEY));
//        stage.setDebugAll(true);
        inputControllerMultiplexer = new InputMultiplexer(stage);
        Gdx.input.setInputProcessor(inputControllerMultiplexer);

        cam = new OrthographicCamera(Gdx.graphics.getWidth(), Gdx.graphics.getHeight());
        cam.setToOrtho(false);

        Button button = new Button(game.skin, "leftarrow");
        button.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new MainMenuScreen(game));
                dispose();
            }
        });
        button.setPosition(ShaderLessons.SCREENSIZEX - 60, 10);
        stage.addActor(button);

        create();
    }

    public void create() {
        tex = new Texture(Gdx.files.internal("images/slider.png"));
//        tex2 = new Texture(Gdx.files.internal("images/pt_sans_00.png"));
        tex.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
//        tex2.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);

        //important since we aren't using some uniforms and attributes that SpriteBatch expects
        ShaderProgram.pedantic = false;

        shader = new ShaderProgram(
                Gdx.files.internal("shaders/lesson5.vert"),
                Gdx.files.internal("shaders/lesson5.frag")
        );

        //Good idea to log any warnings if they exist
        if (shader.getLog().length()!=0)
            Gdx.app.error("debug", shader.getLog());

        //create our sprite batch
        batchL5 = new SpriteBatch();

        // Setup uniforms for our shader
        shader.begin();
        shader.setUniformf("dir", 0f, 0f);
        shader.setUniformf("resolution", FBO_SIZE);
        shader.setUniformf("radius", 1f);
        shader.end();

        blurTargetA = new FrameBuffer(RGBA8888, FBO_SIZE, FBO_SIZE, false);
        blurTargetB = new FrameBuffer(RGBA8888, FBO_SIZE, FBO_SIZE, false);
        fboRegion = new TextureRegion(blurTargetA.getColorBufferTexture());
        fboRegion.flip(false, true);
   }

    @Override
    public void show() {

    }

    @Override
    public void render(float delta) {
        Gdx.gl.glClearColor(0, 0.2f, 0, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        stage.act(delta);

        //Start rendering to an offscreen color buffer
        blurTargetA.begin();

        //Clear the offscreen buffer with an opaque background
        Gdx.gl.glClearColor(0.5f, 0.5f, 0.5f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        //before rendering, ensure we are using the default shader
        batchL5.setShader(null);

        //resize the batch projection matrix before drawing with it
        resizeBatch(FBO_SIZE, FBO_SIZE);

        //now we can start drawing...
        batchL5.begin();

        //draw our scene here
        renderEntities(batchL5);

        //finish rendering to the offscreen buffer
        batchL5.flush();

        //finish rendering to the offscreen buffer
        blurTargetA.end();

        //now let's start blurring the offscreen image
        batchL5.setShader(shader);

        //since we never called batch.end(), we should still be drawing
        //which means are blurShader should now be in use

        //ensure the direction is along the X-axis only
        shader.setUniformf("dir", 1f, 0f);

        //update blur amount based on touch input
        float mouseXAmt = Gdx.input.getX() / (float)Gdx.graphics.getWidth();
        shader.setUniformf("radius", mouseXAmt * MAX_BLUR);

        //our first blur pass goes to target B
        blurTargetB.begin();

        //we want to render FBO target A into target B
        fboRegion.setTexture(blurTargetA.getColorBufferTexture());

        //draw the scene to target B with a horizontal blur effect
        batchL5.draw(fboRegion, 0, 0);

        //flush the batch before ending the FBO
        batchL5.flush();

        //finish rendering target B
        blurTargetB.end();

        //now we can render to the screen using the vertical blur shader

        //update our projection matrix with the screen size
        resizeBatch(Gdx.graphics.getWidth(), Gdx.graphics.getHeight());

        //update the blur only along Y-axis
        shader.setUniformf("dir", 0f, 1f);

        //update the Y-axis blur radius
        float mouseYAmt = Gdx.input.getY() / (float)Gdx.graphics.getHeight();
        shader.setUniformf("radius", mouseYAmt * MAX_BLUR);

        //draw target B to the screen with a vertical blur effect
        fboRegion.setTexture(blurTargetB.getColorBufferTexture());
        batchL5.draw(fboRegion, 0, 0);

        //reset to default shader without blurs
        batchL5.setShader(null);

        //finally, end the batch since we have reached the end of the frame
        batchL5.end();

        stage.draw();
    }

    @Override
    public void resize(int width, int height) {
        stage.getViewport().update(width, height, true);
    }

    void resizeBatch(int width, int height) {
        cam.setToOrtho(false, width, height);
        batchL5.setProjectionMatrix(cam.combined);
    }

    void renderEntities(SpriteBatch batch) {
        batch.draw(tex, 0, 0);
//        batch.draw(tex2, tex.getWidth()+5, 30);
    }

    @Override
    public void pause() {
    }

    @Override
    public void resume() {
    }

    @Override
    public void hide() {
    }

    @Override
    public void dispose() {
        tex.dispose();
//        tex2.dispose();
        shader.dispose();
        batchL5.dispose();
        stage.dispose();
    }
}
