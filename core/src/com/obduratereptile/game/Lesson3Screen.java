package com.obduratereptile.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.InputMultiplexer;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.glutils.ShaderProgram;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Button;
import com.badlogic.gdx.scenes.scene2d.utils.ClickListener;
import com.badlogic.gdx.utils.viewport.FitViewport;

/**
 * Created by Marc on 10/24/2017.
 */

public class Lesson3Screen implements Screen {
    public ShaderLessons game;

    public Texture tex;
    public ShaderProgram shader;
    public SpriteBatch batchL3;

    public OrthographicCamera cam;
    public InputMultiplexer inputControllerMultiplexer;
    public Stage stage;

    public Lesson3Screen(final ShaderLessons game) {
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
        tex = new Texture(Gdx.files.internal("images/scene.png"));

        //important since we aren't using some uniforms and attributes that SpriteBatch expects
        ShaderProgram.pedantic = false;

        shader = new ShaderProgram(
                Gdx.files.internal("shaders/lesson3.vert"),
                Gdx.files.internal("shaders/lesson3.frag")
        );

        //Good idea to log any warnings if they exist
        if (shader.getLog().length()!=0)
            Gdx.app.error("debug", shader.getLog());

        //create our sprite batch
        batchL3 = new SpriteBatch(1000, shader);
        batchL3.setShader(shader);
    }

    @Override
    public void show() {

    }

    @Override
    public void render(float delta) {
        Gdx.gl.glClearColor(0, 0.2f, 0, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        stage.act(delta);

        batchL3.begin();
        batchL3.draw(tex, 0, 0, Gdx.graphics.getWidth(), Gdx.graphics.getHeight());
        batchL3.end();

        stage.draw();
    }

    @Override
    public void resize(int width, int height) {
        cam.setToOrtho(false, width, height);
        batchL3.setProjectionMatrix(cam.combined);

        //bind the shader, then set the uniform, then unbind the shader
        shader.begin();
        shader.setUniformf("resolution", width, height);
        shader.end();

        stage.getViewport().update(width, height, true);
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
        shader.dispose();
        batchL3.dispose();
        stage.dispose();
    }
}
