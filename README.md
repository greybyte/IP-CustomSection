# Custom Section plugin for ImpressPages CMS

This plugin allows to define editable custom sections, which can be dragged to a page like regular widgets:

![Example](https://fat.gfycat.com/SphericalOddballChinesecrocodilelizard.gif)

# Features

* define custom sections with editable elements
* handles text, rich text and images
* define repeatable blocks inside custom sections

# Usage

Create a folder `sections` in your theme's directory. Add custom sections by adding a .PHP file for each section.

Define editable areas in custom section like this:

```php
<section class="well-4">
    <div class="container">
        // editable text (inline-level elements only)
        <?php echo $s->text('h3', 'head', 'Latest News')?>
        // editable image
        <?php echo $s->img('myimage', 'images/default.jpg', 99, 99, 'img-circle') ?>
        // editable rich text (allows block-level elements) 
        <?php echo $s->richtext('div', 'head', '<p>Lorem ipsum<br>dolor sit amet</p>')?>
    </div>
</section>
```

## Text elements

Text elements can contain text and inline markup, but no block line elements.

Function: ```$s->text($tag, $varname, $defaultval="Lorem Ipsum", $cssclass="")```

| Argument         | required?  | Description |
|------------------|-------|----------------------------------------------|
|```$tagname```    | yes   | wrapper tag, e.g. ```<p>```, ```<h1>```      | 
|```$varname```    | yes   | variable name (must be unique within widget) |
|```$defaultval``` | no    | Default Value                                |
|```$cssclass```   | no    | CSS class(es) to apply to wrapper tag        |


## Rich Text elements

Text elements can contain any markup.

Function: ```$s->richtext($tag, $varname, $defaultval="Lorem Ipsum", $cssclass="")```

| Argument         | required?  | Description |
|------------------|-------|----------------------------------------------|
|```$tagname```    | yes   | wrapper tag, e.g. ```<p>```, ```<h1>```      | 
|```$varname```    | yes   | variable name (must be unique within widget) |
|```$defaultval``` | no    | Default Value                                |
|```$cssclass```   | no    | CSS class(es) to apply to wrapper tag        |


## Images

Images can point to any image from the repository.

Function: ```$s->img($varname, $defaultval, $width, $height, $cssclass="")```

| Argument         | required?  | Description |
|------------------|-------|----------------------------------------------|
|```$varname```    | yes   | variable name (must be unique within widget) |
|```$defaultval``` | yes   | Default image (pointing to Theme asset)      |
|```$width```      | yes   | width of image                               |
|```$height```     | yes   | height of image in px                        |
|```$cssclass```   | no    | CSS class(es) to apply to ```<img>``` tag    |


## Repeatable blocks

```$s->repeat()``` is for blocks which must have a certain markup, but can be repeated multiple times.

To use it, first create a subfolder ```repeat``` below ```Themedir/sections```, and create a PHP file
 for the repeatable block inside. Use ```$s->[text|richtext|image]()``` inside repeatable block as you
 would in a regular section. You don't need add indices to variable names, $s->repeat() will take care
 of that.
  
In the containing section, use ```$s->repeat($template, $min=1, $max=-1, $wrapTag='div', $wrapClass='')```:

| Argument         | required?  | Description                               |
|------------------|-------|------------------------------------------------|
|```$template```   | yes   | name of PHP file below ```repeat/``` subfolder |
|```$min```        | no    | minimum number of repetitions                  |
|```$max```        | no    | maximum number of repetitions                  |
|```$wrapTag```    | no    | tag in which repeated blocks are wrapped       |
|```$wrapclass```  | no    | optional CSS class(es) to apply to wrap tag    |

### Example



```php
# ThemeDir/sections/repeat/Image.php
<li>
  <div class="img-circle">
    <?php echo $s->img('image', 'img/myDefaultImage.jpg', 150, 150); ?>
  </div>
</li>

# ThemeDir/sections/Gallery.php
<h1>Look at my images!</h1>

<?php echo $s->repeat('Image', 1, -1, 'ul', 'gallery'); ?>
```