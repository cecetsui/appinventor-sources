package com.google.appinventor.client.widgets;

import com.google.gwt.user.client.ui.Composite;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.event.dom.client.KeyDownEvent;
import com.google.gwt.event.dom.client.KeyDownHandler;
import com.google.gwt.user.client.Command;
import com.google.gwt.event.dom.client.KeyCodes;
import com.google.appinventor.client.editor.youngandroid.BlocklyPanel;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.appinventor.client.widgets.TextButton;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Image;

import java.util.ArrayList;
import java.util.List;
import javax.script.*;
import  java.lang.Double.*;

public class SearchBox extends Composite {

    private BlocklyPanel blockArea;
    private TextBox searchBox;
    private TextButton upButton, downButton;
    private final Image upButtonPic = new Image("http://www.designofsignage.com/application/symbol/hospital/image/600x600/arrow-up.jpg");
    private final Image downButtonPic = new Image("http://www.clipartbest.com/cliparts/dir/ozo/dirozod7T.jpeg");
    private final String imageWH = "10";

    public SearchBox(BlocklyPanel blocks) {
        blockArea = blocks;


        HorizontalPanel panel = new HorizontalPanel();



        upButtonPic.setSize(imageWH + "px", imageWH + "px");
        downButtonPic.setSize(imageWH + "px", imageWH + "px");

        upButton = new TextButton(upButtonPic);
        upButton.addClickHandler(new ClickHandler() {
            public void onClick(ClickEvent click) {
                blockArea.zoomToSearchBlock(1);
            }
        });

        downButton = new TextButton(downButtonPic);
        downButton.addClickHandler(new ClickHandler() {
            public void onClick(ClickEvent click) {
                blockArea.zoomToSearchBlock(-1);
            }
        });

        searchBox = new TextBox();
        searchBox.setTitle("Search Blocks");
        searchBox.getElement().setAttribute("placeholder","Search Blocks...");
        searchBox.addKeyDownHandler(new KeyDownHandler() {
            public void onKeyDown(KeyDownEvent event) {
                String queried = searchBox.getText();
                int keyCode = event.getNativeKeyCode();
                if ((keyCode == KeyCodes.KEY_ENTER) && (queried != "")) {
                    blockArea.startSearch(queried);
                    upButton.setEnabled(true);
                    downButton.setEnabled(true);
                    //Call start to search for blocks
                } else if ((keyCode == KeyCodes.KEY_ESCAPE) || (keyCode == KeyCodes.KEY_DELETE) || (keyCode == KeyCodes.KEY_BACKSPACE)) {
                    //Call stop to stop the search (revert blocks' colors, collapse blocks, etc.)
                    blockArea.stopSearch();
                    upButton.setEnabled(false);
                    downButton.setEnabled(false);
                } else if ((keyCode == KeyCodes.KEY_DOWN) || (keyCode == KeyCodes.KEY_LEFT)) {
                    blockArea.zoomToSearchBlock(-1);
                    //Call zoomToSearchedBlock to go to the previous block
                } else if ((keyCode == KeyCodes.KEY_UP) || (keyCode == KeyCodes.KEY_RIGHT)) {
                    //Call zoomToSearchedBlock to go to the next block
                    blockArea.zoomToSearchBlock(1);
                }
            }
        }) ;

        panel.add(searchBox);
        panel.add(upButton);
        panel.add(downButton);

        upButton.setEnabled(false);
        downButton.setEnabled(false);

        initWidget(panel);
    }

}

// public class SearchBox extends TextBox {

//     private BlocklyPanel blockArea;

//     public SearchBox(BlocklyPanel blocks) {
//         super();
//         setTitle("Search Blocks");
//         getElement().setAttribute("placeholder","Search Blocks...");
//         blockArea = blocks;
//         addKeyDownHandler(new KeyDownHandler() {
//             public void onKeyDown(KeyDownEvent event) {
//                 String queried = getText();
//                 int keyCode = event.getNativeKeyCode();
//                 if ((keyCode == KeyCodes.KEY_ENTER) && (queried != "")) {
//                     blockArea.startSearch(queried);
//                     //Call start to search for blocks
//                 } else if ((keyCode == KeyCodes.KEY_ESCAPE) || (keyCode == KeyCodes.KEY_DELETE) || (keyCode == KeyCodes.KEY_BACKSPACE)) {
//                     //Call stop to stop the search (revert blocks' colors, collapse blocks, etc.)
//                     blockArea.stopSearch();
//                 } else if ((keyCode == KeyCodes.KEY_DOWN) || (keyCode == KeyCodes.KEY_LEFT)) {
//                     blockArea.zoomToSearchBlock(-1);
//                     //Call zoomToSearchedBlock to go to the previous block
//                 } else if ((keyCode == KeyCodes.KEY_UP) || (keyCode == KeyCodes.KEY_RIGHT)) {
//                     //Call zoomToSearchedBlock to go to the next block
//                     blockArea.zoomToSearchBlock(1);
//                 }
//             }
//         }) ;
//     }

// }