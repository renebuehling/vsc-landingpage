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