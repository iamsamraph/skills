import {mountTicker} from './motion-ticker.js';

const dialog=document.querySelector('.signup-dialog');
document.querySelector('[data-open-form]').addEventListener('click',()=>dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const bounds=dialog.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
});

mountTicker({root:document.querySelector('.ticker'),style:'roll',toggle:document.querySelector('.motion-toggle')});

// This callback name is supplied by the official MailerLite embed.
window.ml_webform_success_47973998=function(){
  document.querySelector('.ml-subscribe-form-47973998 .row-success').style.display='block';
  document.querySelector('.ml-subscribe-form-47973998 .row-form').style.display='none';
  document.querySelector('#signup-title').textContent='You’re nearly there.';
};

// Preserve the provider's embed-view notification without blocking the form.
fetch('https://assets.mailerlite.com/jsonp/2764371/forms/203085210600867329/takel').catch(()=>{});
