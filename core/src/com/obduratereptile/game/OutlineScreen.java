package com.obduratereptile.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.InputMultiplexer;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.graphics.glutils.FrameBuffer;
import com.badlogic.gdx.graphics.glutils.ShaderProgram;
import com.badlogic.gdx.input.GestureDetector;
import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Button;
import com.badlogic.gdx.scenes.scene2d.utils.ClickListener;
import com.badlogic.gdx.utils.viewport.FitViewport;

import static com.badlogic.gdx.graphics.Pixmap.Format.RGBA8888;

/**
 * Created by Marc on 10/24/2017.
 */

public class OutlineScreen implements Screen {
    public ShaderLessons game;

    public Texture tex;
//    public Texture tex2;
    public ShaderProgram shader;
    public FrameBuffer blurTargetA, blurTargetB;
    public TextureRegion fboRegionA, fboRegionB;
    public SpriteBatch batch;

    public static final float MAX_BLUR = 2f;

    public OrthographicCamera cam, cam2;
    public InputMultiplexer inputControllerMultiplexer;
    public Stage stage;

    public OutlineScreen(final ShaderLessons game) {
        this.game = game;

        stage = new Stage(new FitViewport(ShaderLessons.SCREENSIZEX, ShaderLessons.SCREENSIZEY));
//        stage.setDebugAll(true);
        inputControllerMultiplexer = new InputMultiplexer(stage);
        Gdx.input.setInputProcessor(inputControllerMultiplexer);

        cam = new OrthographicCamera();
        cam2 = new OrthographicCamera();

        inputControllerMultiplexer = new InputMultiplexer(stage);
        Gdx.input.setInputProcessor(inputControllerMultiplexer);
        inputControllerMultiplexer.addProcessor(new GestureDetector(new OrthoGestureListener(cam)));

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
        tex = new Texture(Gdx.files.internal("images/testImage.png"));
        tex.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);

        //important since we aren't using some uniforms and attributes that SpriteBatch expects
        ShaderProgram.pedantic = false;

        shader = new ShaderProgram(
                Gdx.files.internal("shaders/outline.vert"),
                Gdx.files.internal("shaders/outline.frag")
        );

        //Good idea to log any warnings if they exist
        if (shader.getLog().length()!=0)
            Gdx.app.error("debug", shader.getLog());

        //create our sprite batch
        batch = new SpriteBatch();

        // Setup uniforms for our shader
        shader.begin();
        shader.setUniformf("dir", 0f, 0f);
//        shader.setUniformf("resolution", FBO_SIZE);
        shader.setUniformf("width", tex.getWidth());
        shader.setUniformf("height", tex.getHeight());
        shader.setUniformf("radius", 1f);
        shader.setUniformf("color", new Vector3(1.0f, 1.0f, 1.0f));
        shader.end();

        blurTargetA = new FrameBuffer(RGBA8888, tex.getWidth(), tex.getHeight(), false);
        blurTargetB = new FrameBuffer(RGBA8888, tex.getWidth(), tex.getHeight(), false);
        fboRegionA = new TextureRegion(blurTargetA.getColorBufferTexture(), tex.getWidth(), tex.getHeight());
        fboRegionA.flip(false, true);
        fboRegionB = new TextureRegion(blurTargetB.getColorBufferTexture(), tex.getWidth(), tex.getHeight());
        fboRegionB.flip(false, true);
   }

    @Override
    public void show() {

    }

    @Override
    public void render(float delta) {
        Gdx.gl.glClearColor(0, 0.2f, 0, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        stage.act(delta);

        cam.update();
        cam2.update();

        batch.setShader(shader);
        resizeBatch(tex.getWidth(), tex.getHeight());

        // setup edgedetection
        shader.begin();
        shader.setUniformi("edgedetect", 1);
        shader.setUniformf("radius", 5f);
        shader.end();

        // draw from tex to FBO B
        blurTargetB.begin();
        batch.begin();
        batch.draw(tex,0,0);
        batch.end();
        batch.flush();
        blurTargetB.end();

        // setup H-blur
        shader.begin();
        shader.setUniformi("edgedetect", 0);
        shader.setUniformf("dir", 1f, 0f);
        float mouseXAmt = Gdx.input.getX() / (float)Gdx.graphics.getWidth();
        shader.setUniformf("radius", mouseXAmt * MAX_BLUR);
        shader.end();

        // draw from FBO B to FBO A
        blurTargetA.begin();
        batch.begin();
        batch.draw(fboRegionB,0,0);
//        batch.draw(tex,0,0);
        batch.end();
        batch.flush();
        blurTargetA.end();

        // setup V-blur
        shader.begin();
        shader.setUniformf("dir", 0f, 1f);
        float mouseYAmt = Gdx.input.getY() / (float)Gdx.graphics.getHeight();
        shader.setUniformf("radius", mouseYAmt * MAX_BLUR);
        shader.end();

        // draw from FBO A to FBO B
        blurTargetB.begin();
        batch.begin();
        batch.draw(fboRegionA,0,0);
        batch.end();
        batch.flush();
        blurTargetB.end();

        // use the default shader
        batch.setShader(null);

        // draw from FBO B to screen
        batch.setProjectionMatrix(cam.combined);

        batch.begin();
        batch.draw(fboRegionB, 100, 100);
        batch.end();

        stage.draw();
    }

    public float worldWidth = 1000;

    @Override
    public void resize(int width, int height) {
        stage.getViewport().update(width, height, true);

        resizeCamera(width, height);
    }

    void resizeCamera(float width, float height) {
        cam.setToOrtho(false, worldWidth, worldWidth * height / width);
    }

    void resizeBatch(int width, int height) {
        worldWidth = cam.viewportWidth;
        cam2.setToOrtho(false, width, height);
        batch.setProjectionMatrix(cam2.combined);
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
        blurTargetA.dispose();
        blurTargetB.dispose();
        shader.dispose();
        batch.dispose();
        stage.dispose();
    }
}
