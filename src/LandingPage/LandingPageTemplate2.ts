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
   * @returns HTML
   */
  public makeHTML():string
  {
    let s:string = landingpageHtml;

   
    s = s.replace('/*%landingpage2.scss%*/',landingpageCss).replace('/*%landingpage2.js%*/',landingpageJs);

    for (const [key, value] of Object.entries(icons)) //replace all ${iconname} placeholders with actual SVG source from iconography.ts
    {
      s = s.replaceAll('${'+key+'}',value);
    }

    return s;
  }
}