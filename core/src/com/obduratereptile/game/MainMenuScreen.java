package com.obduratereptile.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.scenes.scene2d.InputEvent;
import com.badlogic.gdx.scenes.scene2d.Stage;
import com.badlogic.gdx.scenes.scene2d.ui.Skin;
import com.badlogic.gdx.scenes.scene2d.ui.Table;
import com.badlogic.gdx.scenes.scene2d.ui.TextButton;
import com.badlogic.gdx.scenes.scene2d.utils.ClickListener;
import com.badlogic.gdx.utils.viewport.FitViewport;

/**
 * Created by Marc on 10/3/2017.
 */

public class MainMenuScreen extends Stage implements Screen {
    public OrthographicCamera camera;
    final public ShaderLessons game;
    public Skin skin;
    public Table table;

    public MainMenuScreen(final ShaderLessons game) {
        super(new FitViewport(ShaderLessons.SCREENSIZEX, ShaderLessons.SCREENSIZEY));
        Gdx.input.setInputProcessor(this);

        this.game = game;
        this.skin = game.skin;

        camera = new OrthographicCamera();
        camera.setToOrtho(false, ShaderLessons.SCREENSIZEX, ShaderLessons.SCREENSIZEY);

        table = new Table(skin);
        table.setFillParent(true);
        addActor(table);

        TextButton textbutton = new TextButton("Lesson 1", skin);
        textbutton.setPosition(ShaderLessons.SCREENSIZEX/2f - 150f, ShaderLessons.SCREENSIZEY/2f - 20f);
        textbutton.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new Lesson1Screen(game));
                dispose();
            }
        });
        table.add(textbutton);

        table.row();
        textbutton = new TextButton("Lesson 2", skin);
        textbutton.setPosition(ShaderLessons.SCREENSIZEX/2f - 150f, ShaderLessons.SCREENSIZEY/2f - 20f);
        textbutton.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new Lesson2Screen(game));
                dispose();
            }
        });
        table.add(textbutton);

        table.row();
        textbutton = new TextButton("Lesson 3", skin);
        textbutton.setPosition(ShaderLessons.SCREENSIZEX/2f - 150f, ShaderLessons.SCREENSIZEY/2f - 20f);
        textbutton.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new Lesson3Screen(game));
                dispose();
            }
        });
        table.add(textbutton);

        table.row();
        textbutton = new TextButton("Lesson 4", skin);
        textbutton.setPosition(ShaderLessons.SCREENSIZEX/2f - 150f, ShaderLessons.SCREENSIZEY/2f - 20f);
        textbutton.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new Lesson4Screen(game));
                dispose();
            }
        });
        table.add(textbutton);

        table.row();
        textbutton = new TextButton("Lesson 5", skin);
        textbutton.setPosition(ShaderLessons.SCREENSIZEX/2f - 150f, ShaderLessons.SCREENSIZEY/2f - 20f);
        textbutton.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new Lesson5Screen(game));
                dispose();
            }
        });
        table.add(textbutton);

        table.row();
        textbutton = new TextButton("Outline", skin);
        textbutton.setPosition(ShaderLessons.SCREENSIZEX/2f - 150f, ShaderLessons.SCREENSIZEY/2f - 20f);
        textbutton.addListener(new ClickListener(){
            @Override
            public void clicked(InputEvent event, float x, float y){
                game.setScreen(new OutlineScreen(game));
                dispose();
            }
        });
        table.add(textbutton);

    }

    @Override
    public void show() {

    }

    @Override
    public void render(float delta) {
        Gdx.gl.glClearColor(0, 0, 0.2f, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        camera.update();
        game.batch.setProjectionMatrix(camera.combined);

        act(delta);

        game.batch.begin();
        draw();
        game.batch.end();
    }

    @Override
    public void resize(int width, int height) {
        getViewport().update(width, height, true);
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

    }
}
