import * as vscode from 'vscode';
import { icons } from './iconography';

//@ts-ignore webpack loading syntax not recongized
import landingpageHtml from '!!raw-loader!./content/landingpage2.html';
//@ts-ignore webpack loading syntax not recongized
import landingpageCss from '!!raw-loader!./content/dist/landingpage2.min.css';

//@ts-ignore webpack loading syntax not recongized
import landingpageJs from '!!raw-loader!./content/landingpage2.js';


/**
 * Loads content/html and performs parsing of css/js/icon-svgs.
 */
export class LandingPageTemplate2
{
  /**
   * Generates the HTML source to be injected into the webview.
   * @param assetPath Path of src/assets converted to Webview URL, see [Loading Local Content](https://code.visualstudio.com/api/extension-guides/webview#loading-local-content)
   * @returns HTML
   */
  public makeHTML(assetPath:vscode.Uri):string
  {
    let s:string = landingpageHtml;
   
    s = 
    s.replaceAll('/*%landingpage2.scss%*/',landingpageCss)
    .replaceAll('/*%landingpage2.js%*/',landingpageJs)
    .replaceAll('%assetPath%',assetPath.toString());
   

    for (const [key, value] of Object.entries(icons)) //replace all ${iconname} placeholders with actual SVG source from iconography.ts
    {
      s = s.replaceAll('${'+key+'}',value);
    }

    return s;
  }
}