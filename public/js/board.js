$(document).ready(function() {
    var Board = {
        init: function(params) {
            this.params = params;
            this.bindUI();
            this.initCradDrag();
            this.initEditableListName();
        },
        initCradDrag: function () {
            $(".card-con").each(function(index, el) {
                $(el).sortable({
                    connectWith: ".card-con",
                    receive: function( event, ui ) {
                        var targetList = event.target;
                        var targetCard = ui.item[0];
                        var listId = $(targetList).data('listid');
                        var cardId = $(targetCard).data('cardid');

                        $.ajax({
                            url: 'changeCardList',
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                listId: listId, 
                                cardId: cardId
                            },
                            success: function (data) {
                                console.log(data);
                            },
                            error: function (error) {
                                var response = JSON.parse(error.responseText);
                                console.log(response);
                            }
                        });

                    },
                }).disableSelection();
            });
        },
        initEditableListName: function () {
            $(".board-panel-title").each(function(index, el) {
                $.fn.editable.defaults.mode = 'popup';
                $(el).editable({
                    validate: function(value) {
                        if($.trim(value) == '') 
                            return 'Value is required.';
                    },
                    type: 'text',
                    url:'update-list-name',  
                    title: 'Edit List Name',
                    placement: 'top', 
                    send:'always',
                    ajaxOptions: {
                        dataType: 'json'
                    }
                });
            }); 
        },
        bindUI: function () {
            var that = this;
            this.params['saveBoardBtn'].on('click', function(event) {
                event.preventDefault();
                that.saveBoard();
            });

            $('#saveListName').on('click', function(event) {
                event.preventDefault();
                that.saveList($(this).closest('.panel-body').find('form').serialize(), this);
            });

            $(document).on('click', '.show-input-field', function() {
                var currentList = $(this).hide();
                that.targetList =  $(currentList).parent();
                $(this).closest('.panel-body').find('form').show();
            });

            $(document).on('click', '.close-input-field', function() {
                $(this).closest('.panel-body').find('.show-input-field').show();
                $(this).closest('.panel-body').find('form').hide();
            });

            $(document).on('click', '#saveCard', function(event) {
                event.preventDefault();
                that.saveCard($(this).closest('.panel-body').find('form').serialize(), this);
            });
        },
        saveCard: function (data, curentBtnClicked) {
            that = this;
            $.ajax({
                url: 'postCard',
                type: 'POST',
                dataType: 'json',
                data: data,
                success: function (data) {
                    $(that.targetList).find('.card-con').append(
                        '<li class="list-group-item board-list-items ui-sortable-handle" id="card_'+data.id+'" data-cardid="'+ data.id +'"><a data-toggle="modal" href="#card-detail">'+ data.card_title +'</a></li>'
                    );
                    $(that.targetList).find('form').hide();
                    $(that.targetList).find('a.show-input-field').show();
                },
                error: function (error) {
                    var response = JSON.parse(error.responseText);
                    $(curentBtnClicked).closest('form').find('#dynamic-board-input-con').find('.alert').remove();
                    $.each(response, function(index, val) {
                        $(curentBtnClicked).closest('form').find('#dynamic-board-input-con').addClass('has-error');
                        $(curentBtnClicked).closest('form').find('#dynamic-board-input-con').prepend('<div class="alert alert-danger"><li>'+ val +'</li></div>');
                    });
                }
            });
        },
        saveBoard: function () {
            that = this;
            $.ajax({
                url: 'postBoard',
                type: 'POST',
                dataType: 'json',
                data: {
                    boardTitle: that.params['boardTitle'].val(),
                    boardPrivacyType: that.params['boardPrivacyType'].val() 
                },
                success: function (data) {
                    $(that.params['createBoardLink']).closest(".col-lg-3").before(
                        '<div class="col-lg-3">'+
                            '<a data-toggle="modal" href="http://localhost:8000/board?id='+data.id+'" class="board-main-link-con">'+
                                '<div class="board-link">'+
                                    '<div class="row">'+
                                        '<div class="col-lg-8">'+
                                            '<h2 style="font-size: 20px; ">'+
                                                data.boardTitle +
                                            '</h2>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</a>'+
                        '</div>'
                    );
                    that.params['createNewBoardModal'].modal('hide') 
                    that.params['boardTitle'].val('');
                    that.params['boardTitleCon'].removeClass('has-error');
                    that.params['boardTitleCon'].find('.alert').remove();
                },
                error: function (error) {
                    var response = JSON.parse(error.responseText);
                    that.params['boardTitleCon'].find('.alert').empty();
                    $.each(response, function(index, val) {
                        that.params['boardTitleCon'].addClass('has-error');
                        that.params['boardTitleCon'].prepend('<div class="alert alert-danger"><li>'+ val +'</li></div>');
                    });
                }
            }); 
        },
        saveList: function (data, curentBtnClicked) {
            that = this;
            $.ajax({
                url: 'postListName',
                type: 'POST',
                dataType: 'json',
                data: data,
                success: function (data) {
                    console.log(data);
                    $(curentBtnClicked).closest(".bcategory-list").before(
                        '<div class="bcategory-list" data-list-id="' + data.id + '">'+
                            '<div class="panel panel-default">'+
                                '<div class="panel-heading">'+
                                    '<div class="row">'+
                                        '<div class="col-lg-10">'+
                                            '<h3 class="panel-title board-panel-title editable editable-click" data-pk="' + data.id + '">' + data.list_name + '</h3>'+
                                        '</div>'+
                                        '<div class="col-lg-2">'+
                                            '<span data-listid="' + data.id + '" class="glyphicon glyphicon-trash delete-list" aria-hidden="true" style="cursor: pointer;"></span>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="panel-body">'+
                                    '<ul class="list-group">'+
                                        '<div class="card-con ui-sortable" data-listid="' + data.id + '">'+
                                        '</div>'+
                                    '</ul>'+
                                    '<a href="#" class="show-input-field">Add a card...</a>'+
                                    '<form action="" method="POST" role="form" style="display: none;">'+
                                        '<div class="form-group" id="dynamic-board-input-con" style="margin-bottom: 8px;">'+
                                            '<textarea name="card-title" class="form-control" rows="3"></textarea>'+
                                            '<input type="hidden" name="list_id" value="' + data.id + '">'+
                                            '<input type="hidden" name="board_id" value="' + data.board_id + '">'+    
                                        '</div>'+
                                        '<div class="form-group" style="margin-bottom: 0px;">'+
                                            '<button type="submit" class="btn btn-primary" id="saveCard">Save</button> <span class="glyphicon glyphicon-remove close-input-field" aria-hidden="true"></span>'+
                                        '</div>'+
                                    '</form>'+
                                '</div>'+
                            '</div>'+
                        '</div>'
                    );
                    that.initCradDrag();
                    that.initEditableListName();
                    // that.params['createNewBoardModal'].modal('hide');
                    that.params['boardTitle'].val('');
                    that.params['boardTitleCon'].removeClass('has-error');
                    that.params['boardTitleCon'].find('.alert').remove();
                },
                error: function (error) {
                    var response = JSON.parse(error.responseText);
                    $(curentBtnClicked).closest('form').find('#dynamic-board-input-con').find('.alert').remove()
                    $.each(response, function(index, val) {
                        $(curentBtnClicked).closest('form').find('#dynamic-board-input-con').addClass('has-error');
                        $(curentBtnClicked).closest('form').find('#dynamic-board-input-con').prepend('<div class="alert alert-danger"><li>'+ val +'</li></div>');
                    });
                }
            });
        }
    };
    Board.init({
        boardTitle          :   $('#boardTitle'),
        boardPrivacyType    :   $('#boardPrivacyType'),
        saveBoardBtn        :   $('#save-board'),
        createNewBoardModal :   $('#create-new-board'),
        boardTitleCon       :   $('#boardTitleCon'),
        saveListNameBtn     :   $('#saveListName'),
        createBoardLink     :   $('.board-create-link')
    });
    $.ajaxSetup({
        beforeSend: function() {
            if ($("#loadingbar").length === 0) {
                $("body").append("<div id='loadingbar'></div>")
                $("#loadingbar").addClass("waiting").append($("<dt/><dd/>"));
                $("#loadingbar").width((50 + Math.random() * 30) + "%");
            }
        },
        complete : function() {
            $("#loadingbar").width("101%").delay(200).fadeOut(400, function() {
                $(this).remove();
            });
        }
    });
});