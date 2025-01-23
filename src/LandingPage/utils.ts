import { Uri } from "vscode";

/**
 * Data envelope for {@link parseURI} result. 
 */
interface UriScan
{
  /**
   * File or folder basename, which is usually
   * the file name without extension or the folder name.
   */
  basename:string;
  /**
   * If URI has a dot notation in its name, this field
   * contains the extension without dot, i.e. 'txt'.
   */
  ext?:string;
}

/**
 * Analyses an URI for basename and extension
 * parts that can be used for label auto-generation.
 * @param uri URI to process.
 * @returns Name parts.
 */
export function parseURI(uri:Uri):UriScan
{
  const result:UriScan={basename:''};

  let name = uri.fsPath.split(/[\\\/]/).pop()||'error';
  let pos = name.lastIndexOf('.');
  result.basename=name; 
  if (pos>0) //file
  {
    result.basename = name.substring(0,pos);
    result.ext = name.substring(pos+1);
  }
  //else //folder

  return result;
}