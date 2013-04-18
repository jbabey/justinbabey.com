$(document).ready(function () {
    Khet.initialize($('#board'));
});

var Khet = (function ($) {
    // begin private variables
    var turn;
    var board = [];
    var rows = 8;
    var cols = 10;
    var tileWidth = 50;
    var tileHeight = 50;
    var preMovePosition;
    var draggableInitialized = false;
    var directions = {
        up: 'up',
        right: 'right',
        down: 'down',
        left: 'left'
    };
    var selectors = {
        blank: '.blank',
        allLasers: '.withLaser, .verticalLaser, .horizontalLaser',
        movablePieces: '.pyramid, .scarab, .obelisk',
        // the turn variable stores who's turn it is
        getRotatablePieces: function () {
            return '.pyramid.' + turn + ', .sphinx.' + turn + ', .scarab.' + turn + ', .obelisk.' + turn;
        }
    };
    var classes = {
        blank: 'blank',
        horizontalLaser: 'horizontalLaser',
        verticalLaser: 'verticalLaser',
        red: 'red',
        blue: 'blue',
        pyramid: 'pyramid',
        north: 'north',
        northeast: 'northeast',
        east: 'east',
        southeast: 'southeast',
        south: 'south',
        southwest: 'southwest',
        west: 'west',
        northwest: 'northwest',
        withLaser: 'withLaser',
        sphinx: 'sphinx',
        scarab: 'scarab',
        obelisk: 'obelisk',
        backslash: 'backslash',
        forwardslash: 'forwardslash',
        destroyed: 'destroyed'
    };
    var dataKeys = {
        col: 'col',
        row: 'row'
    };
    var positions = {
        topLeft: { col: 0, row: 0 },
        topRight: { col: cols - 1, row: 0 },
        bottomLeft: { col: 0, row: rows - 1 },
        bottomRight: { col: cols - 1, row: rows - 1 }
    };
    var filterFunctions = {
        blankTile: function () {
            return $(this).hasClass(classes.blank);
        },
        atPosition: function (element, position) {
            return element.data(dataKeys.col) === position.col &&
                element.data(dataKeys.row) === position.row;
        }
    };
    // end private variables

    // begin private functions
    var buildBoard = function (boardElement) {
        for (var colNum = 0; colNum < cols; colNum++) {
            board[colNum] = [];
        }

        placePiecesOnBoard();

        for (var rowNum = 0; rowNum < rows; rowNum++) {
            for (colNum = 0; colNum < cols; colNum++) {
                // only paint a blank if there is no tile here yet
                board[colNum][rowNum] = board[colNum][rowNum] || {
                    classes: classes.blank,
                    position: {
                        col: colNum * tileWidth,
                        row: rowNum * tileHeight
                    }
                };
            }
        }

        for (rowNum = 0; rowNum < rows; rowNum++) {
            for (colNum = 0; colNum < cols; colNum++) {
                var currentTile = board[colNum][rowNum];

                $('<div>')
                    .addClass(currentTile.classes)
                    .data({
                        col: colNum,
                        row: rowNum
                    })
                    .css({
                        position: 'absolute',
                        left: currentTile.position.col,
                        top: currentTile.position.row
                    })
                    .appendTo(boardElement);
            }
        }

        // create the "FIRE MAH LAZOR" button
        $('<input>')
            .attr('type', 'button')
            .attr('value', 'FIRIN MAH LAZOR')
            .css({
                position: 'absolute',
                left: cols * tileWidth,
                top: 0
            })
            .click(laserClickHandler)
            .appendTo(boardElement);

        // create the turn indicator label
        $('<span>')
            .attr('id', 'turnIndicator')
            .css({
                position: 'absolute',
                left: cols * tileWidth,
                top: 1 * tileHeight
            })
            .appendTo(boardElement);
    };
    var placePiecesOnBoard = function () {
        var pieces = [
                { classes: [classes.sphinx, classes.red, classes.south].join(' '), col: 0, row: 0 },
                { classes: [classes.sphinx, classes.blue, classes.north].join(' '), col: cols - 1, row: rows - 1 },
                { classes: [classes.pyramid, classes.red, classes.northeast].join(' '), col: 0, row: 3 },
                { classes: [classes.pyramid, classes.red, classes.southeast].join(' '), col: 0, row: 4 },
                { classes: [classes.pyramid, classes.red, classes.southwest].join(' '), col: 2, row: 1 },
                { classes: [classes.pyramid, classes.red, classes.southeast].join(' '), col: 6, row: 5 },
                { classes: [classes.pyramid, classes.red, classes.southeast].join(' '), col: 7, row: 0 },
                { classes: [classes.pyramid, classes.red, classes.southeast].join(' '), col: 7, row: 3 },
                { classes: [classes.pyramid, classes.red, classes.northeast].join(' '), col: 7, row: 4 },
                { classes: [classes.pyramid, classes.blue, classes.southwest].join(' '), col: 2, row: 3 },
                { classes: [classes.pyramid, classes.blue, classes.northwest].join(' '), col: 2, row: 4 },
                { classes: [classes.pyramid, classes.blue, classes.northwest].join(' '), col: 2, row: 7 },
                { classes: [classes.pyramid, classes.blue, classes.northwest].join(' '), col: 3, row: 2 },
                { classes: [classes.pyramid, classes.blue, classes.northeast].join(' '), col: 7, row: 6 },
                { classes: [classes.pyramid, classes.blue, classes.northwest].join(' '), col: 9, row: 3 },
                { classes: [classes.pyramid, classes.blue, classes.southwest].join(' '), col: 9, row: 4 },
                { classes: [classes.scarab, classes.red, classes.backslash].join(' '), col: 4, row: 3 },
                { classes: [classes.scarab, classes.red, classes.forwardslash].join(' '), col: 5, row: 3 },
                { classes: [classes.scarab, classes.blue, classes.forwardslash].join(' '), col: 4, row: 4 },
                { classes: [classes.scarab, classes.blue, classes.backslash].join(' '), col: 5, row: 4 },
                { classes: [classes.obelisk, classes.red, classes.south].join(' '), col: 4, row: 0 },
                { classes: [classes.obelisk, classes.red, classes.south].join(' '), col: 6, row: 0 },
                { classes: [classes.obelisk, classes.blue, classes.north].join(' '), col: 3, row: 7 },
                { classes: [classes.obelisk, classes.blue, classes.north].join(' '), col: 5, row: 7 }
        ];

        var currentPiece;
        for (var i = 0; i < pieces.length; i++) {
            currentPiece = pieces[i];

            board[currentPiece.col][currentPiece.row] = {
                classes: currentPiece.classes,
                position: {
                    col: currentPiece.col * tileHeight,
                    row: currentPiece.row * tileWidth
                }
            };
        }
    };
    var initDraggable = function () {
        if (!draggableInitialized) {
            $(selectors.movablePieces).draggable({
                helper: 'clone'
            });
            draggableInitialized = true;
        }

        if (turn === classes.red) {
            // remove the previous players draggable
            $('.ui-draggable.' + classes.blue).draggable('disable');
            $('.ui-draggable.' + classes.red).draggable('enable');
        } else {
            // remove the previous players draggable
            $('.ui-draggable.' + classes.red).draggable('disable');
            $('.ui-draggable.' + classes.blue).draggable('enable');
        }
    };
    var initDroppable = function () {
        $(selectors.blank).droppable({
            drop: dropHandler
        });
    };
    var initRightClick = function () {
        // remove the previous players mousedown
        $('div').off('mousedown.khet');
        $('div').off('contextmenu.khet');

        $(selectors.getRotatablePieces()).on('mousedown.khet', function (e) {
            // we only care about right clicks, ignore the rest
            if (e.which !== 3) {
                return true;
            }

            var pieceToRotate = $(this);

            var something = rotatePiece(pieceToRotate);
        })
        .on('contextmenu.khet', function (e) {
            // suppress the default right click behavior*, which is to open the right click menu
            // *THIS IS ONE OF THE VERY FEW TIMES THAT SUPPRESSING RIGHT CLICK IS ACTUALLY ACCEPTABLE
            e.preventDefault();
        });
    };
    var rotatePiece = function (pieceToRotate) {
        // always rotate clockwise
        // TODO: verify that only one piece has been moved 90 degrees when a move is committed

        switch (true) {
            // Sphinx rotations
            // sphinx can only rotate between north/west and east/south since they are on the corners of the board
            case pieceToRotate.hasClass(classes.sphinx) && pieceToRotate.hasClass(classes.north):
                pieceToRotate.removeClass(classes.north).addClass(classes.west);
                break;
            case pieceToRotate.hasClass(classes.sphinx) && pieceToRotate.hasClass(classes.west):
                pieceToRotate.removeClass(classes.west).addClass(classes.north);
                break;
            case pieceToRotate.hasClass(classes.sphinx) && pieceToRotate.hasClass(classes.east):
                pieceToRotate.removeClass(classes.east).addClass(classes.south);
                break;
            case pieceToRotate.hasClass(classes.sphinx) && pieceToRotate.hasClass(classes.south):
                pieceToRotate.removeClass(classes.south).addClass(classes.east);
                break;
                // Pyramid Rotations
            case pieceToRotate.hasClass(classes.pyramid) && pieceToRotate.hasClass(classes.northeast):
                pieceToRotate.removeClass(classes.northeast).addClass(classes.southeast);
                break;
            case pieceToRotate.hasClass(classes.pyramid) && pieceToRotate.hasClass(classes.southeast):
                pieceToRotate.removeClass(classes.southeast).addClass(classes.southwest);
                break;
            case pieceToRotate.hasClass(classes.pyramid) && pieceToRotate.hasClass(classes.southwest):
                pieceToRotate.removeClass(classes.southwest).addClass(classes.northwest);
                break;
            case pieceToRotate.hasClass(classes.pyramid) && pieceToRotate.hasClass(classes.northwest):
                pieceToRotate.removeClass(classes.northwest).addClass(classes.northeast);
                break;
                // Scarab Rotations
            case pieceToRotate.hasClass(classes.scarab) && pieceToRotate.hasClass(classes.backslash):
                pieceToRotate.removeClass(classes.backslash).addClass(classes.forwardslash);
                break;
            case pieceToRotate.hasClass(classes.scarab) && pieceToRotate.hasClass(classes.forwardslash):
                pieceToRotate.removeClass(classes.forwardslash).addClass(classes.backslash);
                break;
                // Obelisk Rotations
            case pieceToRotate.hasClass(classes.obelisk) && pieceToRotate.hasClass(classes.north):
                pieceToRotate.removeClass(classes.north).addClass(classes.east);
                break;
            case pieceToRotate.hasClass(classes.obelisk) && pieceToRotate.hasClass(classes.east):
                pieceToRotate.removeClass(classes.east).addClass(classes.south);
                break;
            case pieceToRotate.hasClass(classes.obelisk) && pieceToRotate.hasClass(classes.south):
                pieceToRotate.removeClass(classes.south).addClass(classes.west);
                break;
            case pieceToRotate.hasClass(classes.obelisk) && pieceToRotate.hasClass(classes.west):
                pieceToRotate.removeClass(classes.west).addClass(classes.north);
                break;
            default:
                debugger;
                throw new Error('Unrecognized piece/class combination encountered in rotatePiece!');
        }
    };
    var dropHandler = function (event, ui) {
        // here we can assume the blank square is the drop target since only blanks are droppable
        var blankSquare = $(this);
        var draggedPiece = ui.draggable;

        var sourceState = {
            col: blankSquare.data(dataKeys.col),
            row: blankSquare.data(dataKeys.row)
        };
        var destinationState = {
            col: draggedPiece.data(dataKeys.col),
            row: draggedPiece.data(dataKeys.row)
        };

        // check that the move is valid
        if (!isMoveValid(draggedPiece, sourceState, destinationState)) {
            alert('Invalid move.');
            return;
        }

        var sourcePosition = draggedPiece.position();
        var destinationPosition = blankSquare.position();

        // DOM: move the piece from the original position to the new square
        draggedPiece.css({
            left: destinationPosition.left,
            top: destinationPosition.top
        });

        // DOM: move the blank from the original position to the old square
        blankSquare.css({
            left: sourcePosition.left,
            top: sourcePosition.top
        });

        // board state: set the blank's position to the source square
        blankSquare.data({
            col: destinationState.col,
            row: destinationState.row,
        });

        // board state: set the dragged piece's position to the destination square
        draggedPiece.data({
            col: sourceState.col,
            row: sourceState.row,
        });
    };
    var isMoveValid = function (movedPiece, oldPiecePosition, newPiecePosition) {
        // TODO: use preMovePosition to ensure a player doesnt move more than once
        // TODO: scarab can move on top of other pieces to swap positions with them
        switch (true) {
            case movedPiece.hasClass(classes.pyramid) || movedPiece.hasClass(classes.scarab) || movedPiece.hasClass(classes.obelisk):
                // pyramids can move 1 square in any direction
                // we don't need to worry about the board boundaries because there are no droppable targets but the board
                var deltaCol = Math.abs(newPiecePosition.col - oldPiecePosition.col);
                var deltaRow = Math.abs(newPiecePosition.row - oldPiecePosition.row);

                if (deltaCol > 1 || deltaRow > 1) {
                    return false;
                } else {
                    return true;
                }
            default:
                debugger;
                throw new Error('Unrecognized piece type passed to isMoveValid!');
        }
    };
    var laserClickHandler = function (e) {
        // find the origin of the laser depending on whose turn it is
        var originTile = $('.' + classes.sphinx + '.' + turn);

        var currentPosition = {
            col: originTile.data(dataKeys.col),
            row: originTile.data(dataKeys.row)
        };

        var currentDirection = getSphinxDirection(originTile);

        var currentTile;
        while (isPositionOnBoard(currentPosition)) {
            currentTile = $('div').filter(function () {
                return filterFunctions.atPosition($(this), currentPosition);
            });
            //console.log(currentTile);
            // TODO: destructions
            currentDirection = handleCollisions(currentTile, currentDirection);

            // handleCollisions returns undefined if the laser destroyed a piece and should stop
            if (!currentDirection) {
                break;
            }

            // advance the laser position according to the new direction
            if (currentDirection === directions.up) {
                // move the position up 1
                currentPosition = {
                    col: currentPosition.col,
                    row: currentPosition.row - 1
                };
            } else if (currentDirection === directions.right) {
                // move the position right 1
                currentPosition = {
                    col: currentPosition.col + 1,
                    row: currentPosition.row
                };
            } else if (currentDirection === directions.down) {
                // move the position down 1
                currentPosition = {
                    col: currentPosition.col,
                    row: currentPosition.row + 1
                };
            } else if (currentDirection === directions.left) {
                // move the position left 1
                currentPosition = {
                    col: currentPosition.col - 1,
                    row: currentPosition.row
                };
            }
        }

        // TODO: disable everything during these 2 seconds
        // in 2 second, hide the laser and switch turns
        setTimeout(function () {
            switchTurns();
            $(selectors.allLasers).removeClass(classes.withLaser + ' ' + classes.verticalLaser + ' ' + classes.horizontalLaser);
        }, 2000);
    };
    var isPositionOnBoard = function (position) {
        return position.col >= 0 && position.col <= cols - 1 &&
            position.row >= 0 && position.row <= rows - 1;
    };
    var getPyramidDirection = function (direction, currentTile) {
        // TODO: rewrite this using some fancy math trick or something??
        switch (true) {
            case direction === directions.up && currentTile.hasClass(classes.southwest):
                return directions.left;
            case direction === directions.up && currentTile.hasClass(classes.southeast):
                return directions.right;
            case direction === directions.right && currentTile.hasClass(classes.northwest):
                return directions.up;
            case direction === directions.right && currentTile.hasClass(classes.southwest):
                return directions.down;
            case direction === directions.down && currentTile.hasClass(classes.northwest):
                return directions.left;
            case direction === directions.down && currentTile.hasClass(classes.northeast):
                return directions.right;
            case direction === directions.left && currentTile.hasClass(classes.northeast):
                return directions.up;
            case direction === directions.left && currentTile.hasClass(classes.southeast):
                return directions.down;
            default:
                // not returning a direction will trigger the "destroyed" logic in handleCollisions
                return undefined;
        }
    };
    var getScarabDirection = function (direction, currentTile) {
        switch (true) {
            case direction === directions.up && currentTile.hasClass(classes.forwardslash):
                return directions.right;
            case direction === directions.up && currentTile.hasClass(classes.backslash):
                return directions.left;
            case direction === directions.right && currentTile.hasClass(classes.forwardslash):
                return directions.up;
            case direction === directions.right && currentTile.hasClass(classes.backslash):
                return directions.down;
            case direction === directions.down && currentTile.hasClass(classes.forwardslash):
                return directions.left;
            case direction === directions.down && currentTile.hasClass(classes.backslash):
                return directions.right;
            case direction === directions.left && currentTile.hasClass(classes.forwardslash):
                return directions.down;
            case direction === directions.left && currentTile.hasClass(classes.backslash):
                return directions.up;
        }
    };
    var getSphinxDirection = function (originTile) {
        switch (true) {
            case originTile.hasClass(classes.north):
                return directions.up;
            case originTile.hasClass(classes.east):
                return directions.right;
            case originTile.hasClass(classes.south):
                return directions.down;
            case originTile.hasClass(classes.west):
                return directions.left;
        }
    };
    var handleCollisions = function (currentTile, laserDirection) {
        // TODO: obelisk and pharoah collisions
        switch (true) {
            case currentTile.hasClass(classes.sphinx):
                // the laser is just leaving the sphinx tile, add the laser and continue in the same direction
                currentTile.addClass(classes.withLaser);
                return laserDirection;
            case currentTile.hasClass(classes.pyramid):
                // the laser is hitting a pyramid, handle the reflection or destroy the piece
                currentTile.addClass(classes.withLaser);
                var newDirection = getPyramidDirection(laserDirection, currentTile);

                if (!newDirection) {
                    // if no direction was returned, it hit the back of a pyramid, destroy the piece
                    currentTile.addClass(classes.destroyed);

                    setTimeout(function () {
                        // ui-draggable is the class that tells jQuery draggable that the piece can be drag/dropped on
                        currentTile.removeClass(currentTile.get(0).className).addClass(classes.blank + ' ui-draggable');
                    }, 2000);

                    // returning undefined to stop the laser from continuing in laserClickHandler
                    return undefined;
                } else {
                    return newDirection;
                }
            case currentTile.hasClass(classes.scarab):
                // the laser is hitting a pyramid, handle the reflection
                currentTile.addClass(classes.withLaser);
                var newDirection = getScarabDirection(laserDirection, currentTile);

                return newDirection;
            case currentTile.hasClass(classes.blank):
                // the laser is passing over a blank tile, add the laser and continue in the same direction
                if (laserDirection === directions.up || laserDirection === directions.down) {
                    currentTile.addClass(classes.verticalLaser);
                } else if (laserDirection === directions.left || laserDirection === directions.right) {
                    currentTile.addClass(classes.horizontalLaser);
                }

                return laserDirection;
            default:
                debugger;
                throw new Error('Unknown tile classes encountered in handleCollisions!');
        }
    };
    var switchTurns = function () {
        // switch to the other players turn
        // on the first hit this will initialize it to reds turn
        turn = turn === classes.red ? classes.blue : classes.red;

        // update the turn indicator label
        $('#turnIndicator').text('It is ' + turn + 's turn!');

        // rebind the right click and draggables so the other player can take their turn
        initDraggable();
        initRightClick();
    };
    // end private functions

    // begin public functions
    var initialize = function (boardElement) {
        buildBoard(boardElement);
        switchTurns();
        initDroppable();
    };
    // end public functions

    return {
        initialize: initialize
    };
})(jQuery);