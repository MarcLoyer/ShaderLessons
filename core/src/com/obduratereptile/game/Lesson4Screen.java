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

public class Lesson4Screen implements Screen {
    public ShaderLessons game;

    public Texture tex0, tex1, mask;
    public ShaderProgram shader;
    public SpriteBatch batchL4;

    public OrthographicCamera cam;
    public InputMultiplexer inputControllerMultiplexer;
    public Stage stage;

    public Lesson4Screen(final ShaderLessons game) {
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
        tex0 = new Texture(Gdx.files.internal("images/grass.png"));
        tex1 = new Texture(Gdx.files.internal("images/dirt.png"));
        mask = new Texture(Gdx.files.internal("images/mask.png"));

        //important since we aren't using some uniforms and attributes that SpriteBatch expects
        ShaderProgram.pedantic = false;

        shader = new ShaderProgram(
                Gdx.files.internal("shaders/lesson4.vert"),
                Gdx.files.internal("shaders/lesson4.frag")
        );

        //Good idea to log any warnings if they exist
        if (shader.getLog().length()!=0)
            Gdx.app.error("debug", shader.getLog());

        //create our sprite batch
        batchL4 = new SpriteBatch(1000, shader);
        batchL4.setShader(shader);

        shader.begin();
        shader.setUniformi("u_texture1", 1);
        shader.setUniformi("u_mask", 2);
        shader.end();

        //bind mask to glActiveTexture(GL_TEXTURE2)
        mask.bind(2);

        //bind dirt to glActiveTexture(GL_TEXTURE1)
        tex1.bind(1);

        //now we need to reset glActiveTexture to zero!!!! since sprite batch does not do this for us
        Gdx.gl.glActiveTexture(GL20.GL_TEXTURE0); // <-- changed from GL10

        //tex0 will be bound when we call SpriteBatch.draw
   }

    @Override
    public void show() {

    }

    @Override
    public void render(float delta) {
        Gdx.gl.glClearColor(0, 0.2f, 0, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        stage.act(delta);

        batchL4.begin();
        batchL4.draw(tex0, 50, 50);
        batchL4.end();

        stage.draw();
    }

    @Override
    public void resize(int width, int height) {
        cam.setToOrtho(false, width, height);
        batchL4.setProjectionMatrix(cam.combined);

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
        tex0.dispose();
        tex1.dispose();
        mask.dispose();
        shader.dispose();
        batchL4.dispose();
        stage.dispose();
    }
}
