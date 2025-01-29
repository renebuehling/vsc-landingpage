const vscode = acquireVsCodeApi();

// const state = 
// {

// };

function getActiveTool()
{
  return document.body.dataset['activeTool'];
}

function selectTool(event)
{
  document.body.dataset['activeTool'] = event.target.id;
  for(let button of document.querySelectorAll('#mainToolbar button'))
  {
    button.classList.toggle('active',(button.id===getActiveTool()));
  }
}




function diag(msg)
{
  console.log('💎',msg);
  //document.getElementById('pseudoconsole').innerText = msg;
}

function alert(msg)
{
  vscode.postMessage({command:'test',text:'🐕 alerting: '+msg});
}

const typesvg_folder = '${folder}';
const typesvg_workspace = '${fileSliders}';
const typesvg_question = '${fileQuestion}';

let prototypes = 
{
  group:null,
  project:null
};

function initPrototypes()
{        
  prototypes.group= document.querySelector('div[data-prototype].group');
  prototypes.project= prototypes.group.querySelector('div[data-prototype].project');
}


function addGroup(landingPageGroup)
{
  let newGroup=prototypes.group.cloneNode(true);
  delete newGroup.dataset['prototype'];
  newGroup.dataset['guid']=landingPageGroup.guid;
  
  // for(const labeled of newGroup.querySelectorAll('[data-field="group.label"]'))
  //   labeled.innerText = landingPageGroup.label;

  prototypes.group.parentElement.appendChild( newGroup );

  //landingPageGroup.projects.forEach((landingPageProject)=>{addProject(landingPageProject,newGroup)});      
  return newGroup;
}

function addProject(landingPageProject, elGroup)
{
  let newPro=prototypes.project.cloneNode(true);
  delete newPro.dataset['prototype'];
  newPro.dataset['guid']=landingPageProject.guid;
  
  // for(const labeled of newPro.querySelectorAll('[data-field="project.label"]'))
  //   labeled.innerText = landingPageProject.label;

  
  // let svg = typesvg_folder;
  // if (Math.random()>0.499) svg = typesvg_workspace;

  // for(const labeled of newPro.querySelectorAll('[data-field="project.typesvg"]'))
  //   labeled.innerHTML = svg;

  elGroup.querySelector('.projects').appendChild( newPro );
  return newPro;
}

function createBookmark(event, pickFolder)
{
  // console.log('createBookmark()');
  const guidProvider = event.target.closest('[data-guid]');
  if (guidProvider) {vscode.postMessage({command:'createBookmark',guid:guidProvider.dataset['guid'],pickFolder:pickFolder});}
  else {alert('Cannot create bookmark, closest guid not found.');}
}

function createGroup()
{
  // console.log('createGroup()');
  vscode.postMessage({command:'createGroup'}); //raises syncModel with forceRebuild:true 
}



let draggingGUID=undefined;
let draggingEl=undefined;
let draggingSealed=false;
let draggingGroup=false;
function startdrag(event)
{
  let guidProvider = event.target.closest('[data-guid]');
  if (!guidProvider) {return;}

  draggingGroup = guidProvider.classList.contains('group');
  draggingSealed = guidProvider.closest('.sealed')!==null;
  document.body.classList.add(draggingGroup?'is-dragging-group':'is-dragging');
  draggingEl=guidProvider;
  draggingEl.classList.add('dragged-item');
  draggingGUID=guidProvider.dataset['guid'];
  // console.log(`start drag of ${draggingGUID}`,event);
}

function stopdrag(event)
{
  document.body.classList.remove('is-dragging','is-dragging-group');
  // console.log('stop drag',event);
  draggingEl.classList.remove('dragged-item');//1st, because draggingEl might be reassigned when cloning a sealed item

  let newGUID;
  if (draggingSealed) 
  {
    newGUID = 'CC-'+(new Date().getTime()); //Caution: MUST be string
    draggingEl = draggingEl.cloneNode(true);
    draggingEl.dataset['guid'] = newGUID;
  }
  else {newGUID=undefined;}

  if (draggingGUID!==undefined)
  {
    if(event.target.classList.contains('dragbefore') || event.target.classList.contains('dragup'))
    {
      let dropGuidProvider = event.target.closest('[data-guid]');
      if (!dropGuidProvider) {return;}
      // console.log(`move ${draggingGUID} BEFORE ${dropGuidProvider.dataset['guid']}`);
      vscode.postMessage({command:'move',guid:draggingGUID, guid2: dropGuidProvider.dataset['guid'],pos:'before', cloneGUID:newGUID });
      dropGuidProvider.insertAdjacentElement('beforebegin', draggingEl);
    }
    else if(event.target.classList.contains('dragafter') || event.target.classList.contains('dragdown'))
    {
      let dropGuidProvider = event.target.closest('[data-guid]');
      if (!dropGuidProvider) {return;}
      // console.log(`move ${draggingGUID} AFTER ${dropGuidProvider.dataset['guid']}`);
      vscode.postMessage({command:'move',guid:draggingGUID, guid2: dropGuidProvider.dataset['guid'],pos:'after', cloneGUID:newGUID });
      dropGuidProvider.insertAdjacentElement('afterend', draggingEl);
    }
    else if (event.target.classList.contains('group-label')) //drop on group, i.e. to allow dropping in empty groups
    {
      let dropGuidProvider = event.target.closest('[data-guid]');
      if (!dropGuidProvider) {return;}
      // console.log(`move ${draggingGUID} AFTER ${dropGuidProvider.dataset['guid']}`);
      vscode.postMessage({command:'move',guid:draggingGUID, guid2: dropGuidProvider.dataset['guid'],pos:'<irrelvant>', cloneGUID:newGUID });
      dropGuidProvider.querySelector('.projects')?.appendChild(draggingEl);
    }
  }
  
  draggingGUID=undefined;  
  draggingEl=null;
  draggingGroup=false;
  draggingSealed=false;
}


function modalHide(event)
{
  // console.log('modal hide',event);
  document.querySelector('.modal').classList.add('hidden');
}

/** Card which was right-clicked. */
let contextCard = undefined;
function modalPaletteShow(event)
{
  contextCard = event.target.closest('[data-guid]');
  // console.log('modal palette SHOW',event,!contextCard?'NOT ContextCard':'HAS ContextCard');
  if (!contextCard) {return;}
  if (contextCard.closest('.sealed')) {return;} //.sealed in parent

  document.querySelector('.modal').classList.remove('hidden');
  let div = document.querySelector('.modal .palette');
  div.style.left = (event.clientX) + 'px';
  div.style.top = (event.clientY) + 'px';
}
function modalPaletteClick(event)
{
  // console.log('modal palette click',event,!contextCard?'NOT ContextCard':'HAS ContextCard');
  if (!contextCard) {return;}

  let pickedShade=event.target.dataset['shade'];
  contextCard.dataset['shade']=pickedShade;
  vscode.postMessage({command:'patch',guid:contextCard.dataset['guid'], field:'shade', value:pickedShade});

  // console.log("🔴 shade",contextCard.dataset['shade'],'into', event.target.dataset['shade']);
  contextCard=null;
}


function setLayout(event, layoutClass, elGroup)
{
  if (!elGroup) {elGroup = event.target.closest('[data-guid]');}
  
  let elProjects = elGroup.querySelector('.projects');
  if (elProjects)
  {
    if(layoutClass==='grid')
    {
      elProjects.classList.add('grid');
      elProjects.classList.remove('list');            
    }
    else //list
    {
      elProjects.classList.remove('grid');
      elProjects.classList.add('list');
    }

    vscode.postMessage({command:'patch',guid:elGroup.dataset['guid'], field:'layout', value:layoutClass});
  }
  else { console.warn('elGroup nil',event,layoutClass,elGroup, elProjects);}
}

function clickGroup(event)
{
  // let guidProvider = event.target.closest('.group[data-guid]');
  // if(!guidProvider) { console.warn('No GUI provider found!',event); return; }
  let guidProvider;
  switch(getActiveTool())
  {
    case 'tRename':
      guidProvider = event.target.closest('[data-guid]');
      if (guidProvider) {vscode.postMessage({command:'rename',guid:guidProvider.dataset['guid']});}
      else {alert('Cannot rename, closest guid not found.');}
      break;
    case 'tDelete':
      guidProvider = event.target.closest('[data-guid]');
      if (guidProvider) {vscode.postMessage({command:'remove',guid:guidProvider.dataset['guid'], dontAsk:event.ctrlKey});}
      else {alert('Cannot remove, closest guid not found.');}
      break;
  }
}
function clickProject(event)
{
  let guidProvider;
  switch(getActiveTool())
  {
    case 'tExplore':
      console.log('open()');
      guidProvider = event.target.closest('[data-guid]');
      if (guidProvider) {vscode.postMessage({command:'open',guid:guidProvider.dataset['guid']});}
      else {alert('Cannot open, closest guid not found.');}
      break;
    default:
      clickGroup(event);
  }
  // let guidProvider = event.target.closest('.project[data-guid]');
  // if(!guidProvider) { console.warn('No GUI provider found!',event); return; }
}


let model/*:LandingPageModel*/={};

window.addEventListener('message', event => 
  {
  const message = event.data; // The JSON data our extension sent
  // diag('got message! '+JSON.stringify(message));

  switch (message.command) 
  {
    case 'syncModel': 
      if (message.forceRebuild===true)
      {
        for(let element of document.querySelectorAll('.group:not([data-prototype])'))
        {
          element.remove();
        }
      }
      let elGUIDs = Array.from( document.querySelectorAll('[data-guid]:not([data-prototype])') ); //dom-elements linked to a guid
      let guidsInModel = []; //collecting all guids present in model (finds removed ones later)
      for(const landingPageGroup of message.model.groups)
      {
        try
        {
          guidsInModel.push(landingPageGroup.guid);

          let elGroup = elGUIDs.length===0? undefined : elGUIDs.find((element) => element.dataset['guid'] === landingPageGroup.guid);
          if (elGroup===undefined) //no html for this group yet, create
          {
            elGroup = addGroup(landingPageGroup);
            elGUIDs.push(elGroup);
          } 
          
          //--- update/sync html and data model
          for(const labeled of elGroup.querySelectorAll('[data-field="group.label"]'))
          {
            labeled.innerText = landingPageGroup.label;
          }

          let isSealed = landingPageGroup.guid==='@vsc-mru'; //auto-generated list may be locked
          if (isSealed) 
          {
            elGroup.classList.add('sealed');
          }

          setLayout(undefined,landingPageGroup.layout||'grid',elGroup);

          //--
          
          for(const landingPageProject of landingPageGroup.projects)
          {
            guidsInModel.push(landingPageProject.guid);

            let elProject = elGUIDs.length===0? undefined : elGUIDs.find((element) => element.dataset['guid'] === landingPageProject.guid);
            if (elProject===undefined) //no html for this project yet, create
            {
              elProject = addProject(landingPageProject, elGroup);
              elGUIDs.push(elProject);
            } 

            //--- update/sync html and data model        
            for(const labeled of elProject.querySelectorAll('[data-field="project.label"]'))
            {
              labeled.innerText = landingPageProject.label;
            }
            
            let svg = typesvg_question;
            if (landingPageProject.icon==='folder') {svg = typesvg_folder;}
            else if (landingPageProject.icon==='workspace') {svg = typesvg_workspace;}
            //else svg = typesvg_question;

            for(const labeled of elProject.querySelectorAll('[data-field="project.typesvg"]'))
            {
              labeled.innerHTML = svg;
            }

            elProject.dataset['shade']=landingPageProject.shade;
            elProject.setAttribute('title',unescape(landingPageProject.path));

          }   
        }catch(error) {console.error(error);}              
      }
      //remove DOM elements which are no longer in current model:
      elGUIDs.forEach((el)=>{
        let guid = el.dataset['guid'];
        if (guidsInModel.indexOf(guid)<0)
        {
          el.remove();
        }
      });
      break;
  }
});


(function() 
{
  initPrototypes();
  // diag('🐕 docready!');
  vscode.postMessage({command:'documentReady'});
}());