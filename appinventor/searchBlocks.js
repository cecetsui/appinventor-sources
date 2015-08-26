/**
 * Created by cecetsui on 6/30/15.
 */
'use strict';

goog.provide('Blockly.SearchBlocks');

goog.require('Blockly.Workspace');
goog.require('Blockly.Block');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');


/**
 * Class for a search box.
 * @param {Object - Blockly.Workspace} workspace The workspace the search box will be corresponding with.
 * @param {String} frame The html configuration frame name.
 * @constructor
 */


/**
 * An array of the blocks that match the query written in.
 * Used when zooming to the next/previous block upon
 * typing in an arrow key.
 * @type {Array}
 * @private
 */
Blockly.SearchBlocks.matchBlocks = null;

/**
 * An array of the blocks that do not match the query written in.
 * Used when reverting the color of the blocks back to 
 * its original color, as these blocks' colors would be
 * gray.
 * @type {Array}
 * @private
 */
Blockly.SearchBlocks.notMatchBlocks = null;

/**
 * An object where the keys are the blocks' id matching the
 * criteria and the values are its parent block that 
 * is collapsed. This is used to collapse/un-collapse the
 * blocks when navigating through them with the arrow keys.
 * @type {Object}
 * @private
 */
Blockly.SearchBlocks.collapsedBlocks = null;

/**
 * Index correlating to which block in the matchBlocks list
 * is being viewed. With an up or right arrow key, the index
 * increases by one to view the next block. With a down or left
 * arrow key, the index decreases by one to view the previous block.
 * @type {number}
 * @private
 */
Blockly.SearchBlocks.currentBlockView = -1;



/**
* Search for the blocks that match with the query. Initialize
* all needed variables to take part.
* @param {String} query The phrase, word, or query that stands as the criteria of search.
**/
Blockly.SearchBlocks.start = function(query) {
  if (Blockly.SearchBlocks.matchBlocks != null || Blockly.SearchBlocks.matchBlocks != undefined) {
    return;
  }
  if (Blockly.selected) {
    Blockly.selected.unselect();
    Blockly.selected = null;
  }
  Blockly.SearchBlocks.getBlocks(query);
  Blockly.SearchBlocks.currentBlockView = -1;
  goog.events.unlisten(Blockly.TypeBlock.docKh_, 'key', Blockly.TypeBlock.handleKey);
  goog.events.unlisten(Blockly.TypeBlock.inputKh_, 'key', Blockly.TypeBlock.handleKey);
  goog.events.listen(Blockly.TypeBlock.docKh_, 'key', Blockly.SearchBlocks.handleKey);
};

/**
* Search for the blocks that match based on the criteria. Sets the 
* matchBlocks, notMatchBlocks, and collapsedBlocks.
* @param {String} query The phrase, word, or query that stands as the criteria of search.
**/
Blockly.SearchBlocks.getBlocks = function(query) {
    var filteredBlocks = []; // Matching blocks
    var notAMatch = []; // Non-matching blocks
    var collapsed = {}; // Object storing any matching blocks within a collapsed block

    var allBlocks = Blockly.mainWorkspace.getAllBlocks();

    query = query.toLowerCase();

    for (var index in allBlocks) {
      var block = allBlocks[index];
      var blockText = block.toString(null, false).toLowerCase();
      if (blockText.indexOf(query) != -1) { //If query is in block's text
        filteredBlocks.push(block);
      } else {
        block.setNotMatchColour();
        notAMatch.push(block);        
      }
      if (block.isCollapsed()) { //If collapsed
        var collapsedChildren = block.getDescendants(); //Inclusive of itself
        var match = [];
        var noMatch = [];
        for (var index in collapsedChildren) {
          var childBlock = collapsedChildren[index];
            var childBlockText = childBlock.toString(null, false).toLowerCase();
            if (childBlockText.indexOf(query) != -1) { //Check if query is in descendent's text
              match.push(childBlock);
            }
        }
        if (match.length > 0) { //If the collapsed block has blocks in it that have the query
          filteredBlocks.concat(match);
          block.revertColour();
          for (var index in match) {
            collapsed[match[index].id] = block;
          }
        }
      }
    }
    Blockly.SearchBlocks.notMatchBlocks = notAMatch;
    Blockly.SearchBlocks.matchBlocks = filteredBlocks;
    Blockly.SearchBlocks.collapsedBlocks = collapsed;
};


/**
* Called when the user presses an arrow key. Highlights the block being viewed in a 
* pink color and brings the block to the center of the viewer.
* @param {number} upOrDown A number (-1 or 1) that would either view the next or previous block.
**/
Blockly.SearchBlocks.zoomToSearchedBlock = function(upOrDown) { //called when user presses up/down arrow key?
  if (Blockly.SearchBlocks.matchBlocks == null || Blockly.SearchBlocks.matchBlocks.length <= 0) {
    return;
  }
  Blockly.TypeBlock.hide();
  goog.events.unlisten(Blockly.TypeBlock.docKh_, 'key', Blockly.TypeBlock.handleKey);
    var metrics = Blockly.mainWorkspace.getMetrics();
    //Figure out the next block (either viewing the next or previous block)
    if (Blockly.SearchBlocks.currentBlockView <= 0 && upOrDown  < 0) { //Going to the last block from the first
        Blockly.SearchBlocks.currentBlockView = Blockly.SearchBlocks.matchBlocks.length-1;
    } else { //Loop through
        Blockly.SearchBlocks.currentBlockView = (Blockly.SearchBlocks.currentBlockView + upOrDown) % Blockly.SearchBlocks.matchBlocks.length;
    }

    //Unselect any selected block (so the highlighting does not override)
    if (Blockly.selected) {
        Blockly.selected.unselect();
        Blockly.selected = null;
    }

    //Un-highlight the previous block
    Blockly.SearchBlocks.unHighlightSearchedBlock();

    // Get new block to view
    var blockToView = Blockly.SearchBlocks.matchBlocks[Blockly.SearchBlocks.currentBlockView];
    
    var isCollapsedBlock = Blockly.SearchBlocks.collapsedBlocks[blockToView.id];
    //If the block is in a collapsed block (meaning it has a value in collapsedBlocks)
    if (isCollapsedBlock != undefined) {
      //uncollapse block to view
      isCollapsedBlock.searchHighlight();
      isCollapsedBlock.setCollapsed(false);
      var isCollapsed = true;
      if (isCollapsedBlock != blockToView) {
        //If the block is not the block being viewed, grey it out. (Initially non-gray so user could 
          //see that the collapsed block also has a matching criteria)
        isCollapsedBlock.setNotMatchColour();
      }
    } else {
      var isCollapsed = false;
    }

    //Highlight block
    blockToView.searchHighlight();
    //Center block in the viewer
    Blockly.mainWorkspace.scrollbar.centerScrolls(blockToView, isCollapsed);
};

/**
* Unhighlight the current searched block.
**/
Blockly.SearchBlocks.unHighlightSearchedBlock = function() {
    if (Blockly.searched) {
        Blockly.searched.unSearchHighlight();
        if (Blockly.SearchBlocks.collapsedBlocks[Blockly.searched.id] != undefined) { // If block was originally collapsed
          Blockly.SearchBlocks.collapsedBlocks[Blockly.searched.id].revertColour(); // Revert colour
          Blockly.SearchBlocks.collapsedBlocks[Blockly.searched.id].setCollapsed(true); // Re-collapse block
        }
        Blockly.searched = null;
    }
};

/**
* Stop the search process. Unhighlight searched blocks. Re-collapse any blocks. Revert the colors of
* all blocks.
**/
Blockly.SearchBlocks.stop = function() {
    Blockly.SearchBlocks.unHighlightSearchedBlock();
    for (var index in Blockly.SearchBlocks.notMatchBlocks) {
        var block = Blockly.SearchBlocks.notMatchBlocks[index];
        block.revertColour();
    }
    Blockly.SearchBlocks.notMatchBlocks = null;
    Blockly.SearchBlocks.matchBlocks = null;
    Blockly.SearchBlocks.collapsedBlocks = null;
    goog.events.unlisten(Blockly.TypeBlock.docKh_, 'key', Blockly.SearchBlocks.handleKey);
    goog.events.listen(Blockly.TypeBlock.docKh_, 'key', Blockly.TypeBlock.handleKey);
};

/**
* Key Handler for the workspace after user has searched for the blocks. (Outside of the search box.)
* @param {Event} e Event being listened for.
**/
Blockly.SearchBlocks.handleKey = function(e) {
  if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 27) {
    Blockly.SearchBlocks.stop();
  } else if (e.keyCode === 37 || e.keyCode === 40){
    Blockly.SearchBlocks.zoomToSearchedBlock(-1);
  } else if (e.keyCode === 38 || e.keyCode === 39) {
    Blockly.SearchBlocks.zoomToSearchedBlock(1);
  } else {
    return;
  }

}










