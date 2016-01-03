<?php
/**
 * @package ImpressPages
 *
 */
namespace Plugin\CustomSection\Widget\CustomSection;


class BlockWrapper
{
	function __construct(array $data=array(), $themeSectionsFolder, $num=-1) {
		$this->num = $num;
		$this->data = $data;
		$this->themeSectionsFolder = $themeSectionsFolder;
		if (!array_key_exists('blocks', $this->data)) {
			$this->data['blocks'] = array();
		}
	}

	function val($varname, $default="")
	{
		if (array_key_exists($varname, $this->data)) {
			return $this->data[$varname];
		} else {
			return $default;
		}
	}

	protected function tag($tagname, $varname, $default="Lorem Ipsum", $class="", $type="Text") {
		$varname = ($this->num!=-1)?$varname.'-'.$this->num:$varname;
		$val = $this->val($varname, $default);
		return "<$tagname class=\"ipsEditable $class\" data-type=\"$type\" data-varname=\"$varname\">$val</$tagname>";
	}

	function text($tagname, $varname, $default='Lorem Ipsum', $class='') {
		return $this->tag($tagname, $varname, $default, $class, 'Text');
	}

	function richtext($tagname, $varname, $default='<p>Lorem Ipsum</p>', $class='') {
		return $this->tag($tagname, $varname, $default, $class, 'RichText');
	}

	function img($varname, $default, $height, $width, $class='', $tagname='img') {
		$varname = ($this->num!=-1)?$varname.'-'.$this->num:$varname;
		$defaultval = ipThemeUrl('assets/').$default;
		if (array_key_exists($varname, $this->data)) {
			$fileName = $this->data[$varname]['fileName'];
			$transform = array(
				'type' => 'crop',
				'x1' => $this->data[$varname]['crop']['x1'],
				'y1' => $this->data[$varname]['crop']['y1'],
				'x2' => $this->data[$varname]['crop']['x2'],
				'y2' => $this->data[$varname]['crop']['y2'],
				'width' => $width,
				'height' => $height
			);
			$url = ipFileUrl(ipReflection($fileName, $transform, $fileName));
			$imgdata = escAttr(json_encode($this->data[$varname]));
		} else {
			$url = $defaultval;
			$imgdata = "";
		}
		return "<$tagname class=\"ipsEditable $class\" data-type=\"Image\" data-varname=\"$varname\"
					data-cssclass=\"$class\" data-image=\"$imgdata\" src=\"$url\"/>";
	}

	function repeat($template, $min=1, $max=-1, $wrapTag='div', $wrapClass='') {
		$repeat = (array_key_exists('repeat', $this->data))?$this->data['repeat']:$min;

		if ($repeat < $min) {
			$repeat = $min;
		}
		if ($max != -1 && $repeat > $max) {
			$repeat = $max;
		}

		$result = "<$wrapTag class=\"ipsRepeat\" data-repeat=$repeat data-repeat-min=$min data-repeat-max=$max>";

		for ($i=0; $i<$repeat; $i++) {
			$skinFile = $this->themeSectionsFolder. '/repeat/' . $template. '.php';
			$result .= ipView($skinFile, array('s' => new BlockWrapper($this->data, $this->themeSectionsFolder, $i)))->render();
		}
		$result .= "</$wrapTag>";
		return $result;
	}
}

class Controller extends \Ip\WidgetController
{
	public function __construct($name, $pluginName, $core)
	{
		$this->name = $name;
		$this->pluginName = $pluginName;
		$this->themeSectionsFolder = ipThemeFile('sections/');
		$this->widgetDir = 'Plugin/CustomSection/Widget/CustomSection/';
		$this->widgetAssetsDir = $this->widgetDir . \Ip\Application::ASSETS_DIR . '/';

		$this->core = false;

		$this->layouts = array();

		// get a list of available custom layouts
		if (is_dir($this->themeSectionsFolder)) {
			foreach(scandir($this->themeSectionsFolder) as $sectionFile) {
				if (is_file($this->themeSectionsFolder . '/' . $sectionFile) && substr($sectionFile, -4) == '.php') {
					$name = substr($sectionFile, 0, -4);
					$this->layouts[] = array('name' => $name, 'title' => $name);
				}
			}
		}
	}

	public function getTitle()
    {
        return __('Custom Section', 'CustomSection', false);
    }

	public function generateHtml($revisionId, $widgetId, $data, $skin)
	{
		if ($skin == 'default') {
			$view = 'Plugin/CustomSection/Widget/CustomSection/skin/default.php';
		} else {
			// TODO: check whether this exists
			$view = $this->themeSectionsFolder.'/'.$skin.'.php';
		}

		$data = array('s' => new BlockWrapper($data, $this->themeSectionsFolder));
		$answer = ipView($view, $data)->render();
		return $answer;
	}

	public function getSkins() {
		$skins = parent::getSkins();
		foreach ($this->layouts as $layout) {
			$skins[] = $layout;
		}
		return $skins;
	}


	public function dataForJs($revisionId, $widgetId, $data, $skin) {
		if (!array_key_exists('repeat', $data))
			$data['repeat'] = 0;
		$data['layouts'] = $this->layouts;
		return $data;
	}

	public function updateImage($widgetId, $postData, $currentData)
	{
		// var_dump($postData);

		$var = $postData['varName'];
		$newImg = $postData['fileName'];
		$newCrop = $postData['crop'];

		// do we have old data?
		if (isset($currentData[$var])) {
			$oldImg = $currentData[$var]['fileName'];
			$oldCrop = $currentData[$var]['crop'];
		} else {
			$oldImg = false;
			$oldCrop = false;
		}

		// unbind/bind file
		if ($newImg != $oldImg) {
			if ($oldImg) {
				\Ip\Internal\Repository\Model::unbindFile($oldImg, 'CustomSection', $widgetId);
			}
			\Ip\Internal\Repository\Model::bindFile($newImg, 'CustomSection', $widgetId);
		}

		// handle cropping
		if ($newCrop != $oldCrop) {
			// ????
		}

		$currentData[$var] = array(
			'fileName' => $newImg,
			'crop' => $newCrop
		);

		return $currentData;
	}

	public function updateContent($widgetId, $postData, $currentData)
	{
		foreach($postData as $k => $v) {
			if ($k != 'method')
				$currentData[$k] = $v;
		}
		return $currentData;
	}

	public function update($widgetId, $postData, $currentData)
	{
		if (isset($postData['method'])) {
			switch ($postData['method']) {

				case 'updateImage':
					return $this->updateImage($widgetId, $postData, $currentData);
					break;

				case 'updateContent':
					return $this->updateContent($widgetId, $postData, $currentData);
					break;
			}
		}
		return $currentData;
	}
}
