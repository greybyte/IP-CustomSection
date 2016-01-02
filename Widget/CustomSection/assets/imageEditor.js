/**
 * @package ImpressPages
 *
 */

(function ($) {
    "use strict";

    var methods = {
        init: function ($widget) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ipsImageEditor');
                // If the plugin hasn't been initialized yet
                if (!data) {
                    $this
                        .data('ipsImageEditor', {
                            widget: $widget,
                            key: $this.data('varname'),
                            cssClass: $this.data('cssclass'),
                            options: $this.data('options'),
                            defaultValue: $this.data('defaultvalue')
                        })
                        .ipModuleInlineManagementControls({
                            'Manage': function () {
                                $this.trigger('ipsImageEditor.openEditPopup');
                            }
                        })
                        .on('ipsImageEditor.openEditPopup', $.proxy(methods.openPopup, $this))
                        .on('click', $.proxy(methods.openPopup, $this));
                }
            });
        },


        openPopup: function () {
            var $self = this,
                $modal = $('#ipsImageEditorPopup'),
                imgdata = this.data('image'),
                options = {};

            if (imgdata) {
                options['image'] = imgdata.fileName;
                options['cropX1'] = imgdata.crop.x1;
                options['cropY1'] = imgdata.crop.y1;
                options['cropX2'] = imgdata.crop.x2;
                options['cropY2'] = imgdata.crop.y2;
            }

            $modal.modal();

            options.enableChangeHeight = true;
            options.enableChangeWidth = true;
            options.maxWindowWidth = 538;
            options.enableUnderscale = true;

            options.autosizeType = 'fit';

            /* ???
            var $img = $this.find('.ipsImage').eq(position);
            if ($img.length == 1) {
                options.windowWidth = 538;
                options.windowHeight = Math.round($img.height() / $img.width() * options.windowWidth);
            }*/

            var $editScreen = $modal.find('.ipsEditScreen');
            $editScreen.ipUploadImage('destroy');
            $editScreen.ipUploadImage(options);
            $modal.find('.ipsConfirm').off().on('click', function () {
                var crop = $editScreen.ipUploadImage('getCropCoordinates');
                var curImage = $editScreen.ipUploadImage('getCurImage');
                $.proxy(methods.updateImage, $self)(curImage, crop);
                $modal.modal('hide');
            });
        },

        updateImage: function(image, crop, callback) {
            var data = {
                method: 'updateImage',
                varName: this.data('varname'),
                fileName: image,
                crop: crop
            },
                $widgetObject = this.data('ipsImageEditor').widget;


            $widgetObject.save(data, 1, function ($widget) {
                $widget.click();
                if (callback) {
                    callback($widget);
                }
            });


            // TODO: call method in controller

            console.log(image, crop);
        }
    };

    $.fn.ipsImageEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipsImageEditor');
        }
    };

})(jQuery);
