/**
 * Model root of the data rendered in the Landing Page view.
 */
export interface LandingPageModel
{
  /** List of group declarations. */
  groups:LandingPageGroup[];
}

/** Super interface for all elements that can be identified via a unique identifier. */
interface LandingPageItem
{
  /** Any string that identifies this item uniquely in this model. */
  guid:string;
  // /** Sort number, may be updated automatically, i.e. when sorting via drag and drop. */
  // order?:number;
}

/**
 * Model for one group that organizes a list of bookmarks.
 */
export interface LandingPageGroup extends LandingPageItem
{  
  /** Display text. */
  label:string;
  /** Collection of bookmarks in this group. */
  projects:LandingPageProject[];
}

export interface LandingPageProject extends LandingPageItem
{
  /** Display text. Can be initialized to the file's basename, but can also be changed to any user defined string. */
  label:string;
  /** Serialized URI to the file or folder that is linked in this bookmark. */
  path?:string;
  /** Hint to icon to display, usually initialized when setting path. */
  icon?:'folder'|'workspace'; // omitted = 'file'
}


export interface ScanResult
{
  /** The element which was searched for, i.e. the group or project with a specific GUID. */
  target:LandingPageGroup|LandingPageProject;
  /** The owner model where the target belongs to. */
  model:LandingPageModel;
  /**
   * If target is a project, then this points to the group which contains the project.
   * If this is omitted, then target is a group, contained in the model.
   */
  ownerGroup?:LandingPageGroup;
}

/**
 * Scans the model for a group or project node identified by a specific GUID.
 * @param guid Identifier for the node. If `undefined` this function returns directly `null`.
 * @param inModel Model to scan.
 * @returns Scan result for found item or null if no item was found.
 */
export function findFirst(guid:string|undefined, inModel:LandingPageModel):ScanResult|null
{
  if (!guid){ return null;}
  if (guid.length>0)
  {
    for(const group of inModel.groups)
    {
      if (group.guid===guid)
      {
        return {target:group, model:inModel};
      }
      for(const project of group.projects)
      {
        if (project.guid===guid) 
        {
          return {target:project, model:inModel, ownerGroup:group};
        }
      }
    }
  }
  return null;
}


/**
 * Test for dev/debugging.
 * //TODO: remove test model
 */
export const demoModel:LandingPageModel=
{
  groups: [
    {
      guid:'{test-group-a}',
      label:'Test-Group A',
      projects:[
        {guid:'{test-prj-a1}',label:'Project A.1'},
        {guid:'{test-prj-a2}',label:'Project A.2'}
      ]
    },
    {
      label:'Test-Group B',
      guid:'{test-group-b}',
      projects:[
        {guid:'{test-prj-b1}',label:'Project B.1'},
        {guid:'{test-prj-b2}',label:'Project B.2'},
        {guid:'{test-prj-b3}',label:'Project B.3'}
      ]
    }
  ]
};