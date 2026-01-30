/**
 * Embed Script Generator
 * Generates the JavaScript code that clients paste into their websites
 */

/**
 * Generate the embed script for a project
 * The script is an IIFE (Immediately Invoked Function Expression) that:
 * 1. Creates/retrieves a unique visitor ID
 * 2. Assigns a variation deterministically using hash
 * 3. Applies the variation (URL param or DOM modification)
 * 4. Tracks the assignment via image beacon
 */
export function generateEmbedScript(
  projectId: string,
  apiEndpoint: string,
): string {
  // Minified version of the script with project-specific config
  return `(function(){
  var O=window.__OPTIMELEON__=window.__OPTIMELEON__||{};
  if(O["${projectId}"])return;
  O["${projectId}"]=true;
  
  var config={
    projectId:"${projectId}",
    api:"${apiEndpoint}"
  };
  
  function getVisitorId(){
    var k="optim_vid";
    try{
      var id=localStorage.getItem(k);
      if(!id){
        id="v_"+Date.now().toString(36)+Math.random().toString(36).substr(2,9);
        localStorage.setItem(k,id);
      }
      return id;
    }catch(e){
      return "v_"+Date.now().toString(36)+Math.random().toString(36).substr(2,9);
    }
  }
  
  function hash(s){
    var h=5381;
    for(var i=0;i<s.length;i++){
      h=(h*33)^s.charCodeAt(i);
    }
    return h>>>0;
  }
  
  function getVariation(vid,pid){
    var vars=["A","B","C","D"];
    return vars[hash(vid+":"+pid)%4];
  }
  
  function applyVariation(v){
    // Add data attribute to document for CSS targeting
    document.documentElement.setAttribute("data-optim-variation",v);
    
    // Show/hide elements based on data-optim-show attribute
    var els=document.querySelectorAll("[data-optim-show]");
    for(var i=0;i<els.length;i++){
      var el=els[i];
      var showFor=el.getAttribute("data-optim-show");
      if(showFor&&showFor.indexOf(v)===-1){
        el.style.display="none";
      }
    }
    
    // Update URL parameter (optional, for analytics tools)
    if(window.location.search.indexOf("variation=")===-1){
      var sep=window.location.search?"&":"?";
      var newUrl=window.location.href+sep+"variation="+v;
      try{
        window.history.replaceState({},"",newUrl);
      }catch(e){}
    }
  }
  
  function track(vid,v){
    try{
      var img=new Image();
      img.src=config.api+"/api/track?v="+encodeURIComponent(vid)+"&p="+encodeURIComponent(config.projectId)+"&var="+v+"&t="+Date.now();
    }catch(e){}
  }
  
  function init(){
    try{
      var vid=getVisitorId();
      var variation=getVariation(vid,config.projectId);
      
      O.visitorId=vid;
      O.variation=variation;
      O.projectId=config.projectId;
      
      applyVariation(variation);
      track(vid,variation);
      
      // Dispatch custom event for integrations
      if(typeof CustomEvent!=="undefined"){
        document.dispatchEvent(new CustomEvent("optimeleon:ready",{
          detail:{visitorId:vid,variation:variation,projectId:config.projectId}
        }));
      }
    }catch(e){
      console.warn("[Optimeleon] Error:",e.message);
    }
  }
  
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
  }else{
    init();
  }
})();`;
}

/**
 * Generate the HTML script tag for embedding
 */
export function generateEmbedCode(
  projectId: string,
  apiEndpoint: string,
): string {
  return `<script src="${apiEndpoint}/api/s/${projectId}"></script>`;
}

/**
 * Get usage instructions for the embed script
 */
export function getUsageInstructions(): string {
  return `
## Usage Instructions

### Basic Setup
Add the script tag to your website's <head> or before </body>:

\`\`\`html
<script src="https://your-app.com/api/s/YOUR_PROJECT_ID"></script>
\`\`\`

### CSS-Based Variations
Use the \`data-optim-variation\` attribute on the html element to style variations:

\`\`\`css
/* Show different hero text per variation */
[data-optim-variation="A"] .hero-title::after { content: "Buy Now!"; }
[data-optim-variation="B"] .hero-title::after { content: "50% Off Today!"; }
[data-optim-variation="C"] .hero-title::after { content: "Join 10,000+ Customers!"; }
[data-optim-variation="D"] .hero-title::after { content: "Free Shipping!"; }
\`\`\`

### Show/Hide Elements
Use \`data-optim-show\` to show elements only for specific variations:

\`\`\`html
<div data-optim-show="A">This shows only for Variation A</div>
<div data-optim-show="B,C">This shows for B and C</div>
<div data-optim-show="A,B,C,D">This shows for all</div>
\`\`\`

### JavaScript Integration
Listen for the ready event:

\`\`\`javascript
document.addEventListener('optimeleon:ready', function(e) {
  console.log('Variation:', e.detail.variation);
  console.log('Visitor ID:', e.detail.visitorId);
});
\`\`\`

Or access directly:
\`\`\`javascript
if (window.__OPTIMELEON__) {
  console.log(window.__OPTIMELEON__.variation);
}
\`\`\`
`;
}
