package com.google.appinventor.client.widgets;

import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.event.dom.client.KeyDownEvent;
import com.google.gwt.event.dom.client.KeyDownHandler;
import com.google.gwt.user.client.Command;
import com.google.gwt.user.client.ui.MenuItem;
import com.google.gwt.user.client.ui.PopupPanel;
import com.google.gwt.event.dom.client.KeyCodes;

import java.util.ArrayList;
import java.util.List;


public class DropDownTextBox extends TextBox {
  private final ContextMenu menu;
  private final List<MenuItem> items;
  
  public static class DropDownItem {
    private final String widgetName;
    private final String caption;
    private final Command command;
    
    public DropDownItem(String widgetName, String caption, Command command) {
      this.widgetName = widgetName;
      this.caption = caption;
      this.command = command;
    }
  }
  
  public DropDownTextBox(String widgetName, String caption, List<DropDownItem> toolbarItems, final boolean rightAlign) {
    super();
    this.menu = new ContextMenu();
    this.items = new ArrayList<MenuItem>();
    for (DropDownItem item: toolbarItems) {
      if (item != null) {
        this.items.add(menu.addItem(item.caption, true, item.command));
      } else {
        menu.addSeparator();
      }
    }
    addKeyDownHandler(new KeyDownHandler() {
      public void onKeyDown(KeyDownEvent event) {
        if (event.getNativeKeyCode() == KeyCodes.KEY_ENTER) {
          menu.setPopupPositionAndShow(new PopupPanel.PositionCallback() {
            public void setPosition(int offsetWidth, int offsetHeight) {
              int left = getAbsoluteLeft();
              if (rightAlign) {
                left += getOffsetWidth() - offsetWidth;
              }
              int top = getAbsoluteTop() + getOffsetHeight();
              menu.setPopupPosition(left,top);
            }
          }) ;
        }
      }
    }) ;
  }


  public void clearAllItems() {
    for (MenuItem item: items) {
      menu.removeItem(item);
    }
    items.clear();
  }
  
  public void addItem(DropDownItem item) {
    this.items.add(menu.addItem(item.caption,true, item.command));
  }
  
  public void removeItem(String itemName) {
    for (MenuItem item: items) {
      if (item.getText().equals(itemName)) {
        menu.removeItem(item);
        items.remove(item);
        break;
      }
    }
  }
  
  public void setItemEnabled(String itemName, boolean enabled) {
    for (MenuItem item : items) {
      if (item.getText().equals(itemName)) {
        item.setEnabled(enabled);
        break;
      }
    }
  }

  
  public ContextMenu getContextMenu() {
    return menu;
  }
}