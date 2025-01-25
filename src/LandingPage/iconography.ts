//TODO: remove unused icons
/**
 * Collection of icons used in this extension. 
 * This collection object is iterated by HTML template parser
 * and each `key` will replace `${key}` in HTML template with the actual SVG source.
 * This way SVG icons can be injected into the html template file.
 */
export const icons=
{
  arrowRightIcon : require('lucide-static/icons/arrow-right.svg'), // return string of an SVG, styling+size in scss!
  ellipsis : require('lucide-static/icons/ellipsis.svg'), 
  squarePlus : require('lucide-static/icons/square-plus.svg'), 
  trash2 : require('lucide-static/icons/trash-2.svg'), 
  eye : require('lucide-static/icons/eye.svg'), 
  eyeClosed : require('lucide-static/icons/eye-closed.svg'), 
  plus : require('lucide-static/icons/plus.svg'), 
  link : require('lucide-static/icons/link-2.svg'), 
  circleX : require('lucide-static/icons/circle-x.svg'), 
  textCursorInput : require('lucide-static/icons/text-cursor-input.svg'),
  layoutGrid : require('lucide-static/icons/layout-grid.svg'), 
  layoutList : require('lucide-static/icons/layout-list.svg'),
  paintbrush : require('lucide-static/icons/paintbrush.svg'),
  gripHorizontal : require('lucide-static/icons/grip-horizontal.svg'),
  gripVertical : require('lucide-static/icons/grip-vertical.svg'),
  folder : require('lucide-static/icons/folder.svg'),
  folderPlus : require('lucide-static/icons/folder-plus.svg'),
  // briefcaseBusiness : require('lucide-static/icons/briefcase-business.svg'),
  appWindow : require('lucide-static/icons/app-window.svg'),
  fileSliders : require('lucide-static/icons/file-sliders.svg'),
  fileQuestion : require('lucide-static/icons/file-question.svg'),
  
  squareMousePointer : require('lucide-static/icons/square-mouse-pointer.svg'),
  move : require('lucide-static/icons/move.svg'),
  
}; 