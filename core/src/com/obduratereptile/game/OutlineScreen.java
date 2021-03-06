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
import com.badlogic.gdx.graphics.glutils.ShapeRenderer;
import com.badlogic.gdx.input.GestureDetector;
import com.badlogic.gdx.math.Rectangle;
import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Button;
import com.badlogic.gdx.scenes.scene2d.ui.Label;
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
    public static final int PAD = 10;

    public boolean doBlur2D = false;
    public int edgeDetectWidth = 1;
    public float blurX = 1.1f;
    public float blurY = 0.6f;

    public Rectangle rect = new Rectangle();

    public OrthographicCamera cam, cam2;
    public InputMultiplexer inputControllerMultiplexer;
    public Stage stage;
    public Label status;
    public Label fps;

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

        status = new Label("", game.skin);
        status.setPosition(10, 10);
        stage.addActor(status);

        fps = new Label("0 fps", game.skin);
        fps.setPosition(ShaderLessons.SCREENSIZEX - 200, 10);
        stage.addActor(fps);

        create();
    }

    public int bufferWidth;
    public int bufferHeight;

    public void create() {
//        tex = new Texture(Gdx.files.internal("images/testImage.png"));
        tex = new Texture(Gdx.files.internal("images/piece_00.png"));
//        tex = new Texture(Gdx.files.internal("images/piece_11.png"));
        tex.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
        Gdx.app.error("debug", "Image size = (" + tex.getWidth() + ", " + tex.getHeight() + ")");
        bufferWidth = tex.getWidth() + 2*PAD;
        bufferHeight = tex.getHeight() + 2*PAD;

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
        shader.setUniformf("width", tex.getWidth() + 2*PAD);
        shader.setUniformf("height", tex.getHeight() + 2*PAD);
        shader.setUniformf("radius", 1f);
        shader.setUniformf("color", new Vector3(1.0f, 1.0f, 1.0f));
        shader.end();

        blurTargetA = new FrameBuffer(RGBA8888, bufferWidth, bufferHeight, false);
        blurTargetB = new FrameBuffer(RGBA8888, bufferWidth, bufferHeight, false);
        fboRegionA = new TextureRegion(blurTargetA.getColorBufferTexture(), bufferWidth, bufferHeight);
        fboRegionA.flip(false, true);
        fboRegionB = new TextureRegion(blurTargetB.getColorBufferTexture(), bufferWidth, bufferHeight);
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

        resizeBatch(bufferWidth, bufferHeight);

        // draw from tex to FBO A
        blurTargetA.begin();
        Gdx.gl.glClearColor(0.5f, 0.5f, 0.5f, 0.0f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
        batch.begin();
        batch.draw(tex, PAD, PAD);
        batch.end();
        batch.flush();
        blurTargetA.end();

        batch.setShader(shader);

        // setup edgedetection
        shader.begin();
        shader.setUniformi("edgedetect", 1);
        shader.setUniformf("radius", 2f);
        shader.end();

        // draw from FBO A to FBO B
        blurTargetB.begin();
        Gdx.gl.glClearColor(0.5f, 0.5f, 0.5f, 0.0f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
        batch.begin();
        batch.draw(fboRegionA,0,0);
        batch.end();
        batch.flush();
        blurTargetB.end();

        // setup H-blur / 2D blur
        shader.begin();
        shader.setUniformi("edgedetect", 0); // turn off edge detection
//        shader.setUniformf("dir", 0f, 1f);
        shader.setUniformf("dir", 1f, 1f);
        float mouseXAmt = Gdx.input.getX() / (float)Gdx.graphics.getWidth();
        shader.setUniformf("radius", mouseXAmt * MAX_BLUR);
        shader.end();

        // draw from FBO B to FBO A
        blurTargetA.begin();
        Gdx.gl.glClearColor(0.5f, 0.5f, 0.5f, 0.0f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
        batch.begin();
        batch.draw(fboRegionB,0,0);
        batch.end();
        batch.flush();
        blurTargetA.end();

//        // setup V-blur
//        shader.begin();
//        shader.setUniformf("dir", 1f, 0f);
//        shader.setUniformi("edgedetect", 0); // turn off edge detection
//        float mouseYAmt = Gdx.input.getY() / (float)Gdx.graphics.getHeight();
//        shader.setUniformf("radius", mouseYAmt * MAX_BLUR);
//        shader.end();
//
//        // draw from FBO A to FBO B
//        blurTargetB.begin();
//        Gdx.gl.glClearColor(0.5f, 0.5f, 0.5f, 0.0f);
//        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
//        batch.begin();
//        batch.draw(fboRegionA,0,0);
//        batch.end();
//        batch.flush();
//        blurTargetB.end();

        // use the default shader
        batch.setShader(null);

        // draw from FBO B to screen
        batch.setProjectionMatrix(cam.combined);

        batch.begin();
//        batch.draw(fboRegionB, 100, 100);
        batch.draw(fboRegionA, 100, 100);
        batch.end();

        game.shapeRenderer.setProjectionMatrix(cam.combined);

        game.shapeRenderer.begin(ShapeRenderer.ShapeType.Line);

        game.shapeRenderer.setColor(0,0,1,1);
        rect.setPosition(100,100);
        rect.setSize(tex.getWidth()+2*PAD, tex.getHeight()+2*PAD);
        game.shapeRenderer.rect(rect.x, rect.y, rect.width, rect.height);

        game.shapeRenderer.setColor(1,1,0,1);
        rect.setPosition(100+PAD, 100+PAD);
        rect.setSize(tex.getWidth(), tex.getHeight());
        game.shapeRenderer.rect(rect.x, rect.y, rect.width, rect.height);

        game.shapeRenderer.end();

        float x = 1000.0f / delta;
        fps.setText(" fps");

        // Optimal seems to be (1.10, 0.60) (for 2 pass 1D filter)
//        status.setText("(" + (mouseXAmt * MAX_BLUR) + ", " + (mouseYAmt * MAX_BLUR) + ")");
        status.setText("" + (mouseXAmt * MAX_BLUR));
        setFPS(delta);
        stage.draw();
    }

    StringBuilder fpsString = new StringBuilder();

    public void setFPS(float delta) {
        int i = (int)(100f / delta);
        float x = (float)i / 100f;

        fpsString.setLength(0);
        fpsString.append(x);
        fpsString.append(" fps");
        fps.setText(fpsString);
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
        cam2.setToOrtho(false, width, height);
        batch.setProjectionMatrix(cam2.combined);
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
