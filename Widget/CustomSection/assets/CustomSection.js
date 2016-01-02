/**
 * @package ImpressPages
 *
 */

var IpWidget_CustomSection = function() {
    "use strict";
    this.$widgetObject = null;

    this.init = function($widgetObject, data) {
        this.$widgetObject = $widgetObject;
        this.skin = this.getCurrentSkin();
        var _self = this;

        if (this.skin == 'default') {
            // show selection dialog
            var $modal = $('#ipWidgetLayoutPopup');

            $modal.ipSkinModal({
                layouts: data.layouts,
                currentLayout: false,
                widgetObject: this.$widgetObject
            })
        }

        this.textEditorConfig = $.extend(ipTinyMceConfig(),
            {
                toolbar1: 'bold italic underline | forecolor backcolor | subscript superscript | link  | removeformat | undo redo',
                toolbar2: false,
                plugins: 'paste, link, colorpicker, textcolor, anchor, autolink',
                valid_elements: "@[class|style],strong,em,br,sup,sub,span,b,u,i,a[name|href|target|title]",
                setup: function (ed, l) {
                    ed.on('change', $.proxy(_self.save, _self));
                }
            });

        this.richEditorConfig = $.extend(ipTinyMceConfig(),
            {
                toolbar1: 'bold italic underline | forecolor backcolor | subscript superscript | link | removeformat | undo redo',
                toolbar2: 'link | bullist numlist | outdent indent | table | code',
                plugins: 'advlist, paste, link, table, colorpicker, textcolor, alignrollup, anchor, autolink, code',
                valid_elements: false,
                setup: function (ed, l) {
                    ed.on('change', $.proxy(_self.save, _self));
                }
            });

        // setup editors
        this.setupEditors(this.$widgetObject);

        // setup repeat
        if ($widgetObject.find('.ipsRepeat').length > 0) {
            $widgetObject.find('.ipsWidgetControls .ipsControls')
                .append('<button class="btn btn-controls btn-xs _add" title="Add"><i class="fa fa-plus-square"></i></button>')
                .append('<button class="btn btn-controls btn-xs _remove" title="Remove"><i class="fa fa-minus-square"></i></button>');
            $widgetObject.on('click', '._add', $.proxy(this.onAddRepeat, this));
            $widgetObject.on('click', '._remove', $.proxy(this.onRemoveRepeat, this));

            // TODO: enable/disable according to min/max
        }

        // hiding active editor to make sure it doesn't appear on top of repository window
        $(document).on('ipWidgetAdded', function(e, data) {
            if (tinymce.activeEditor.theme.panel) {
                tinymce.activeEditor.theme.panel.hide();
            }
        });
    };

    this.getCurrentSkin = function () {
       return this.$widgetObject[0].className.match(/ipSkin-(\w+)/)[1];
    };

    this.onAdd = function () {
        this.$widgetObject.find('.ipsEditable').focus();
    };

    this.onAddRepeat = function () {
        var $newBlock = this.$widgetObject.find('.ipsRepeat > :last-child').clone();
        var num = parseInt(this.$widgetObject.find('.ipsRepeat').data('repeat'));
        $newBlock.find('.ipsEditable').each(function () {
            $(this).removeAttr('id').removeAttr('contenteditable').removeClass('mce_body');
            var varname = $(this).data('varname').replace(/-\d+/, '-'+num.toString());
            $(this).data('varname', varname);
        });
        this.$widgetObject.find('.ipsRepeat').append($newBlock).data('repeat', num+1);
        this.setupEditors($newBlock);
        this.save();
    };

    this.onRemoveRepeat = function () {
        var $repeat = this.$widgetObject.find('.ipsRepeat');
        $repeat.find('> :last-child').remove();
        $repeat.data('repeat', $repeat.data('repeat')-1);
        this.save();
    };

    this.setupEditor = function($elem) {
        switch($elem.data('type')) {
            case 'Text':
                $elem.tinymce(this.textEditorConfig).attr('spellcheck', true);
                break;
            case 'RichText':
                $elem.tinymce(this.richEditorConfig).attr('spellcheck', true);
                break;
            case 'Image':
                $elem.ipsImageEditor(this.$widgetObject);
                break;
        }
    };

    this.setupEditors = function($elem) {
        var _self = this;
        $elem.find('.ipsEditable').each(function () {
            _self.setupEditor.call(_self, $(this));
        });

    };

    this.save = function () {
        var data = {};
        this.$widgetObject.find('.ipsEditable').each(function () {
            if ($(this).data('type') != 'Image')
                data[$(this).data('varname')] = $(this).html();
        });
        data['repeat'] = this.$widgetObject.find('.ipsRepeat').data('repeat');
        data['method'] = 'updateContent';
        this.$widgetObject.save(data);
    };
};
