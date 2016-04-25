
; /* Start:"a:4:{s:4:"full";s:96:"/bitrix/templates/aspro_mshop/components/bitrix/sale.basket.basket/main/script.js?14603719095958";s:6:"source";s:81:"/bitrix/templates/aspro_mshop/components/bitrix/sale.basket.basket/main/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
var basketTimeout;
var totalSum;
var timerBasketUpdate = false;

function setQuantity(basketId, ratio, direction){
	var curVal = parseFloat(BX("QUANTITY_INPUT_" + basketId).value), newVal;
	ratio = parseFloat(ratio);
	newVal = (direction == 'up') ? curVal + ratio : curVal - ratio;
	if (newVal < 0) newVal = 0;
	if (newVal > 0) {
		BX("QUANTITY_INPUT_" + basketId).value = newVal;
		BX("QUANTITY_INPUT_" + basketId).defaultValue = curVal;

		totalSum=0;
		$('#basket_form tr[data-id='+basketId+']').closest('table').find("tbody tr[data-id]").each(function(i, element) {
			id=$(element).attr("data-id");
			count=BX("QUANTITY_INPUT_" + id).value;

			price = $(document).find("#basket_form input[name=item_price_"+id+"]").val();
			sum = count*price;
			totalSum += sum;
			$(document).find("#basket_form [data-id="+id+"] .summ-cell .price").text(jsPriceFormat(sum));
		});

		$("#basket_form .top_total_row span.price").text(jsPriceFormat(totalSum));
		$("#basket_form .top_total_row div.discount").fadeTo( "slow" , 0.2);


		if(timerBasketUpdate){
			clearTimeout(timerBasketUpdate);
			timerBasketUpdate = false;
		}

		timerBasketUpdate = setTimeout(function(){
			updateQuantity('QUANTITY_INPUT_' + basketId, basketId, ratio);
			timerBasketUpdate=false;
		}, 700);
	}
}

function updateQuantity(controlId, basketId, ratio, animate) {
	var newVal = BX(controlId).defaultValue, newVal = parseFloat(BX(controlId).value) || 0; bValidChange = false; // if quantity is correct for this ratio
	if (!newVal) {
		bValidChange = false;
		BX(controlId).value = oldVal;
	}

	newVal -= newVal % ratio;
	var is_int_ratio = (ratio % 1 == 0);
	newVal = is_int_ratio ? parseInt(newVal) : parseFloat(newVal).toFixed(2);

	if (isRealValue(BX("QUANTITY_SELECT_" + basketId))) { var option, options = BX("QUANTITY_SELECT_" + basketId).options, i = options.length; }
	while (i--) {
		option = options[i];
		if (parseFloat(option.value).toFixed(2) == parseFloat(newVal).toFixed(2)) option.selected = true;
	}

	BX("QUANTITY_" + basketId).value = newVal;
	BX("QUANTITY_INPUT_" + basketId).value = newVal;

	$('form[name^=basket_form]').prepend('<input type="hidden" name="BasketRefresh" value="Y" />');
	if (!!BX('COUPON')) BX('COUPON').disabled = true;
	// $.post( arMShopOptions['SITE_DIR']+'ajax/show_basket.php', $("form[name^=basket_form]").serialize(), $.proxy(function( data){
	$.post( $('#cur_page').val(), $("form[name^=basket_form]").serialize(), $.proxy(function( data){	
		if (timerBasketUpdate==false) {
			$("#basket-replace").html(data);
			$("#basket-replace .bigdata_recommended_products_container").css({'position':'absolute', 'opacity':0, 'visibility':'hidden'});
		}
	}));
}

function basketAjaxReload() {
	if (!!BX('COUPON')) BX('COUPON').disabled = true;
	// $.post( arMShopOptions['SITE_DIR']+'ajax/show_basket.php', $("form[name^=basket_form]").serialize(), $.proxy(function( data){
	$.post( $('#cur_page').val(), $("form[name^=basket_form]").serialize(), $.proxy(function( data){	
		$("#basket-replace").html(data);
		$("#basket-replace .bigdata_recommended_products_container").css({'position':'absolute', 'opacity':0, 'visibility':'hidden'});
	}));
}

function delete_all_items(type, item_section, correctSpeed, url){
	$.post( arMShopOptions['SITE_DIR']+"ajax/action_basket.php", "TYPE="+type+"&CLEAR_ALL=Y", $.proxy(function( data ){
		$('input[name="BasketOrder"').remove();
		basketAjaxReload();
	}));
	if($('#basket_line').size()){
		reloadTopBasket('top', $('#basket_line'), 200, 2000, 'N');
	}
}


function deleteProduct(basketId, itemSection, item){
	function _deleteProduct(basketId, itemSection){
		// $.post( arMShopOptions['SITE_DIR']+'ajax/show_basket.php?action=delete&id='+basketId, $.proxy(function( data ){
		$.post( $('#cur_page').val()+'?action=delete&id='+basketId, $.proxy(function( data ){
			$("#basket-replace").html(data);
			$("#basket-replace .bigdata_recommended_products_container").css({'position':'absolute', 'opacity':0, 'visibility':'hidden'});
		}));
		if($('#basket_line').size()){
			reloadTopBasket('top', $('#basket_line'), 200, 2000, 'N');
		}
	}

	if(checkCounters()){
		delFromBasketCounter(item);
		setTimeout(function(){
			_deleteProduct(basketId, itemSection);
		}, 100);
	}
	else{
		_deleteProduct(basketId, itemSection);
	}
}

function delayProduct(basketId, itemSection){
	// $.post( arMShopOptions['SITE_DIR']+'ajax/show_basket.php?action=delay&id='+basketId, function( data ){
	$.post( $('#cur_page').val()+'?action=delay&id='+basketId, function( data ){
		$("#basket-replace").html(data);
		$("#basket-replace .bigdata_recommended_products_container").css({'position':'absolute', 'opacity':0, 'visibility':'hidden'});
	});
	if($('#basket_line').size()){
		reloadTopBasket('top', $('#basket_line'), 200, 2000, 'N');
	}
}

function addProduct(basketId, itemSection)
{
	// $.post( arMShopOptions['SITE_DIR']+'ajax/show_basket.php?action=add&id='+basketId, function( data ) {
	$.post( $('#cur_page').val()+'?action=add&id='+basketId, function( data ) {
		$("#basket-replace").html(data);
		$("#basket-replace .bigdata_recommended_products_container").css({'position':'absolute', 'opacity':0, 'visibility':'hidden'});
	});
	if($('#basket_line').size()){
		reloadTopBasket('top', $('#basket_line'), 200, 2000, 'N');
	}
}


function checkOut(event){
	function _checkOut(href){
		if(typeof href === 'undefined'){
			BX("basket_form").submit();
		}
		else{
			location.href=href;
		}
	}

	if (!!BX('COUPON')) BX('COUPON').disabled = true;
	event = event || window.event;
	var th=$(event.target).parent();
	if(checkCounters('google')){
		checkoutCounter(1, th.data('text'), function() {
			_checkOut(th.data('href'));
		});
		setTimeout(function(){
			_checkOut(th.data('href'));
		}, 600);
	}else{
		_checkOut(th.data('href'));
	}
	return true;
}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:108:"/bitrix/templates/aspro_mshop/components/bitrix/catalog.bigdata.products/mshop/script.min.js?146037191223411";s:6:"source";s:88:"/bitrix/templates/aspro_mshop/components/bitrix/catalog.bigdata.products/mshop/script.js";s:3:"min";s:92:"/bitrix/templates/aspro_mshop/components/bitrix/catalog.bigdata.products/mshop/script.min.js";s:3:"map";s:92:"/bitrix/templates/aspro_mshop/components/bitrix/catalog.bigdata.products/mshop/script.map.js";}"*/
(function(t){if(!!t.JCCatalogBigdataProducts){return}var e=function(t){e.superclass.constructor.apply(this,arguments);this.nameNode=BX.create("span",{props:{className:"bx_medium bx_bt_button",id:this.id},text:t.text});this.buttonNode=BX.create("span",{attrs:{className:t.ownerClass},style:{marginBottom:"0",borderBottom:"0 none transparent"},children:[this.nameNode],events:this.contextEvents});if(BX.browser.IsIE()){this.buttonNode.setAttribute("hideFocus","hidefocus")}};BX.extend(e,BX.PopupWindowButton);t.JCCatalogBigdataProducts=function(t){this.productType=0;this.showQuantity=true;this.showAbsent=true;this.secondPict=false;this.showOldPrice=false;this.showPercent=false;this.showSkuProps=false;this.visual={ID:"",PICT_ID:"",SECOND_PICT_ID:"",QUANTITY_ID:"",QUANTITY_UP_ID:"",QUANTITY_DOWN_ID:"",PRICE_ID:"",DSC_PERC:"",SECOND_DSC_PERC:"",DISPLAY_PROP_DIV:"",BASKET_PROP_DIV:""};this.product={checkQuantity:false,maxQuantity:0,stepQuantity:1,isDblQuantity:false,canBuy:true,canSubscription:true,name:"",pict:{},id:0,addUrl:"",buyUrl:""};this.basketData={useProps:false,emptyProps:false,quantity:"quantity",props:"prop",basketUrl:""};this.defaultPict={pict:null,secondPict:null};this.checkQuantity=false;this.maxQuantity=0;this.stepQuantity=1;this.isDblQuantity=false;this.canBuy=true;this.canSubscription=true;this.precision=6;this.precisionFactor=Math.pow(10,this.precision);this.offers=[];this.offerNum=0;this.treeProps=[];this.obTreeRows=[];this.showCount=[];this.showStart=[];this.selectedValues={};this.obProduct=null;this.obQuantity=null;this.obQuantityUp=null;this.obQuantityDown=null;this.obPict=null;this.obSecondPict=null;this.obPrice=null;this.obTree=null;this.obBuyBtn=null;this.obDscPerc=null;this.obSecondDscPerc=null;this.obSkuProps=null;this.obMeasure=null;this.obPopupWin=null;this.basketUrl="";this.basketParams={};this.treeRowShowSize=5;this.treeEnableArrow={display:"",cursor:"pointer",opacity:1};this.treeDisableArrow={display:"",cursor:"default",opacity:.2};this.lastElement=false;this.containerHeight=0;this.errorCode=0;if("object"===typeof t){this.productType=parseInt(t.PRODUCT_TYPE,10);this.showQuantity=t.SHOW_QUANTITY;this.showAbsent=t.SHOW_ABSENT;this.secondPict=!!t.SECOND_PICT;this.showOldPrice=!!t.SHOW_OLD_PRICE;this.showPercent=!!t.SHOW_DISCOUNT_PERCENT;this.showSkuProps=!!t.SHOW_SKU_PROPS;this.visual=t.VISUAL;switch(this.productType){case 1:case 2:if(!!t.PRODUCT&&"object"===typeof t.PRODUCT){if(this.showQuantity){this.product.checkQuantity=t.PRODUCT.CHECK_QUANTITY;this.product.isDblQuantity=t.PRODUCT.QUANTITY_FLOAT;if(this.product.checkQuantity){this.product.maxQuantity=this.product.isDblQuantity?parseFloat(t.PRODUCT.MAX_QUANTITY):parseInt(t.PRODUCT.MAX_QUANTITY,10)}this.product.stepQuantity=this.product.isDblQuantity?parseFloat(t.PRODUCT.STEP_QUANTITY):parseInt(t.PRODUCT.STEP_QUANTITY,10);this.checkQuantity=this.product.checkQuantity;this.isDblQuantity=this.product.isDblQuantity;this.maxQuantity=this.product.maxQuantity;this.stepQuantity=this.product.stepQuantity;if(this.isDblQuantity){this.stepQuantity=Math.round(this.stepQuantity*this.precisionFactor)/this.precisionFactor}}this.product.canBuy=t.PRODUCT.CAN_BUY;this.product.canSubscription=t.PRODUCT.SUBSCRIPTION;this.canBuy=this.product.canBuy;this.canSubscription=this.product.canSubscription;this.product.name=t.PRODUCT.NAME;this.product.pict=t.PRODUCT.PICT;this.product.id=t.PRODUCT.ID;if(!!t.PRODUCT.ADD_URL){this.product.addUrl=t.PRODUCT.ADD_URL}if(!!t.PRODUCT.BUY_URL){this.product.buyUrl=t.PRODUCT.BUY_URL}if(!!t.BASKET&&"object"===typeof t.BASKET){this.basketData.useProps=!!t.BASKET.ADD_PROPS;this.basketData.emptyProps=!!t.BASKET.EMPTY_PROPS}}else{this.errorCode=-1}break;case 3:if(!!t.OFFERS&&BX.type.isArray(t.OFFERS)){if(!!t.PRODUCT&&"object"===typeof t.PRODUCT){this.product.name=t.PRODUCT.NAME;this.product.id=t.PRODUCT.ID}this.offers=t.OFFERS;this.offerNum=0;if(!!t.OFFER_SELECTED){this.offerNum=parseInt(t.OFFER_SELECTED,10)}if(isNaN(this.offerNum)){this.offerNum=0}if(!!t.TREE_PROPS){this.treeProps=t.TREE_PROPS}if(!!t.DEFAULT_PICTURE){this.defaultPict.pict=t.DEFAULT_PICTURE.PICTURE;this.defaultPict.secondPict=t.DEFAULT_PICTURE.PICTURE_SECOND}}else{this.errorCode=-1}break;default:this.errorCode=-1}if(!!t.BASKET&&"object"===typeof t.BASKET){if(!!t.BASKET.QUANTITY){this.basketData.quantity=t.BASKET.QUANTITY}if(!!t.BASKET.PROPS){this.basketData.props=t.BASKET.PROPS}if(!!t.BASKET.BASKET_URL){this.basketData.basketUrl=t.BASKET.BASKET_URL}}this.lastElement=!!t.LAST_ELEMENT&&"Y"===t.LAST_ELEMENT}if(0===this.errorCode){BX.ready(BX.delegate(this.Init,this))}};t.JCCatalogBigdataProducts.prototype.Init=function(){var e=0,i="",s=null;this.obProduct=BX(this.visual.ID);if(!this.obProduct){this.errorCode=-1}this.obPict=BX(this.visual.PICT_ID);if(!this.obPict){this.errorCode=-2}if(this.secondPict&&!!this.visual.SECOND_PICT_ID){this.obSecondPict=BX(this.visual.SECOND_PICT_ID)}this.obPrice=BX(this.visual.PRICE_ID);if(!this.obPrice){this.errorCode=-16}if(this.showQuantity&&!!this.visual.QUANTITY_ID){this.obQuantity=BX(this.visual.QUANTITY_ID);if(!!this.visual.QUANTITY_UP_ID){this.obQuantityUp=BX(this.visual.QUANTITY_UP_ID)}if(!!this.visual.QUANTITY_DOWN_ID){this.obQuantityDown=BX(this.visual.QUANTITY_DOWN_ID)}}if(3===this.productType){if(!!this.visual.TREE_ID){this.obTree=BX(this.visual.TREE_ID);if(!this.obTree){this.errorCode=-256}i=this.visual.TREE_ITEM_ID;for(e=0;e<this.treeProps.length;e++){this.obTreeRows[e]={LEFT:BX(i+this.treeProps[e].ID+"_left"),RIGHT:BX(i+this.treeProps[e].ID+"_right"),LIST:BX(i+this.treeProps[e].ID+"_list"),CONT:BX(i+this.treeProps[e].ID+"_cont")};if(!this.obTreeRows[e].LEFT||!this.obTreeRows[e].RIGHT||!this.obTreeRows[e].LIST||!this.obTreeRows[e].CONT){this.errorCode=-512;break}}}if(!!this.visual.QUANTITY_MEASURE){this.obMeasure=BX(this.visual.QUANTITY_MEASURE)}}if(!!this.visual.BUY_ID){this.obBuyBtn=BX(this.visual.BUY_ID)}if(this.showPercent){if(!!this.visual.DSC_PERC){this.obDscPerc=BX(this.visual.DSC_PERC)}if(this.secondPict&&!!this.visual.SECOND_DSC_PERC){this.obSecondDscPerc=BX(this.visual.SECOND_DSC_PERC)}}if(this.showSkuProps){if(!!this.visual.DISPLAY_PROP_DIV){this.obSkuProps=BX(this.visual.DISPLAY_PROP_DIV)}}if(0===this.errorCode){if(this.showQuantity){if(!!this.obQuantityUp){BX.bind(this.obQuantityUp,"click",BX.delegate(this.QuantityUp,this))}if(!!this.obQuantityDown){BX.bind(this.obQuantityDown,"click",BX.delegate(this.QuantityDown,this))}if(!!this.obQuantity){BX.bind(this.obQuantity,"change",BX.delegate(this.QuantityChange,this))}}switch(this.productType){case 1:break;case 3:s=BX.findChildren(this.obTree,{tagName:"li"},true);if(!!s&&0<s.length){for(e=0;e<s.length;e++){BX.bind(s[e],"click",BX.delegate(this.SelectOfferProp,this))}}for(e=0;e<this.obTreeRows.length;e++){BX.bind(this.obTreeRows[e].LEFT,"click",BX.delegate(this.RowLeft,this));BX.bind(this.obTreeRows[e].RIGHT,"click",BX.delegate(this.RowRight,this))}this.SetCurrent();break}if(!!this.obBuyBtn){BX.bind(this.obBuyBtn,"click",BX.delegate(this.Basket,this))}if(this.lastElement){this.containerHeight=parseInt(this.obProduct.parentNode.offsetHeight,10);if(isNaN(this.containerHeight)){this.containerHeight=0}this.setHeight();BX.bind(t,"resize",BX.delegate(this.checkHeight,this));BX.bind(this.obProduct.parentNode,"mouseover",BX.delegate(this.setHeight,this));BX.bind(this.obProduct.parentNode,"mouseout",BX.delegate(this.clearHeight,this))}}};t.JCCatalogBigdataProducts.prototype.checkHeight=function(){this.containerHeight=parseInt(this.obProduct.parentNode.offsetHeight,10);if(isNaN(this.containerHeight)){this.containerHeight=0}};t.JCCatalogBigdataProducts.prototype.setHeight=function(){if(0<this.containerHeight){BX.adjust(this.obProduct.parentNode,{style:{height:this.containerHeight+"px"}})}};t.JCCatalogBigdataProducts.prototype.clearHeight=function(){BX.adjust(this.obProduct.parentNode,{style:{height:"auto"}})};t.JCCatalogBigdataProducts.prototype.QuantityUp=function(){var t=0,e=true;if(0===this.errorCode&&this.showQuantity&&this.canBuy){t=this.isDblQuantity?parseFloat(this.obQuantity.value):parseInt(this.obQuantity.value,10);if(!isNaN(t)){t+=this.stepQuantity;if(this.checkQuantity){if(t>this.maxQuantity){e=false}}if(e){if(this.isDblQuantity){t=Math.round(t*this.precisionFactor)/this.precisionFactor}this.obQuantity.value=t}}}};t.JCCatalogBigdataProducts.prototype.QuantityDown=function(){var t=0,e=true;if(0===this.errorCode&&this.showQuantity&&this.canBuy){t=this.isDblQuantity?parseFloat(this.obQuantity.value):parseInt(this.obQuantity.value,10);if(!isNaN(t)){t-=this.stepQuantity;if(t<this.stepQuantity){e=false}if(e){if(this.isDblQuantity){t=Math.round(t*this.precisionFactor)/this.precisionFactor}this.obQuantity.value=t}}}};t.JCCatalogBigdataProducts.prototype.QuantityChange=function(){var t=0,e=true;if(0===this.errorCode&&this.showQuantity){if(this.canBuy){t=this.isDblQuantity?parseFloat(this.obQuantity.value):parseInt(this.obQuantity.value,10);if(!isNaN(t)){if(this.checkQuantity){if(t>this.maxQuantity){e=false;t=this.maxQuantity}else if(t<this.stepQuantity){e=false;t=this.stepQuantity}}if(!e){this.obQuantity.value=t}}else{this.obQuantity.value=this.stepQuantity}}else{this.obQuantity.value=this.stepQuantity}}};t.JCCatalogBigdataProducts.prototype.QuantitySet=function(t){if(0===this.errorCode){this.canBuy=this.offers[t].CAN_BUY;if(this.canBuy){BX.addClass(this.obBuyBtn,"bx_bt_button");BX.removeClass(this.obBuyBtn,"bx_bt_button_type_2");this.obBuyBtn.innerHTML=BX.message("CBD_MESS_BTN_BUY")}else{BX.addClass(this.obBuyBtn,"bx_bt_button_type_2");BX.removeClass(this.obBuyBtn,"bx_bt_button");this.obBuyBtn.innerHTML=BX.message("CBD_MESS_NOT_AVAILABLE")}if(this.showQuantity){this.isDblQuantity=this.offers[t].QUANTITY_FLOAT;this.checkQuantity=this.offers[t].CHECK_QUANTITY;if(this.isDblQuantity){this.maxQuantity=parseFloat(this.offers[t].MAX_QUANTITY);this.stepQuantity=Math.round(parseFloat(this.offers[t].STEP_QUANTITY)*this.precisionFactor)/this.precisionFactor}else{this.maxQuantity=parseInt(this.offers[t].MAX_QUANTITY,10);this.stepQuantity=parseInt(this.offers[t].STEP_QUANTITY,10)}this.obQuantity.value=this.stepQuantity;this.obQuantity.disabled=!this.canBuy;if(!!this.obMeasure){if(!!this.offers[t].MEASURE){BX.adjust(this.obMeasure,{html:this.offers[t].MEASURE})}else{BX.adjust(this.obMeasure,{html:""})}}}}};t.JCCatalogBigdataProducts.prototype.SelectOfferProp=function(){var t=0,e="",i="",s=[],a=null,o=BX.proxy_context;if(!!o&&o.hasAttribute("data-treevalue")){i=o.getAttribute("data-treevalue");s=i.split("_");if(this.SearchOfferPropIndex(s[0],s[1])){a=BX.findChildren(o.parentNode,{tagName:"li"},false);if(!!a&&0<a.length){for(t=0;t<a.length;t++){e=a[t].getAttribute("data-onevalue");if(e===s[1]){BX.addClass(a[t],"bx_active")}else{BX.removeClass(a[t],"bx_active")}}}}}};t.JCCatalogBigdataProducts.prototype.SearchOfferPropIndex=function(t,e){var i="",s=false,a,o,r=[],h=-1,n={},u=[];for(a=0;a<this.treeProps.length;a++){if(this.treeProps[a].ID===t){h=a;break}}if(-1<h){for(a=0;a<h;a++){i="PROP_"+this.treeProps[a].ID;n[i]=this.selectedValues[i]}i="PROP_"+this.treeProps[h].ID;s=this.GetRowValues(n,i);if(!s){return false}if(!BX.util.in_array(e,s)){return false}n[i]=e;for(a=h+1;a<this.treeProps.length;a++){i="PROP_"+this.treeProps[a].ID;s=this.GetRowValues(n,i);if(!s){return false}if(this.showAbsent){r=[];u=[];u=BX.clone(n,true);for(o=0;o<s.length;o++){u[i]=s[o];if(this.GetCanBuy(u)){r[r.length]=s[o]}}}else{r=s}if(!!this.selectedValues[i]&&BX.util.in_array(this.selectedValues[i],r)){n[i]=this.selectedValues[i]}else{n[i]=r[0]}this.UpdateRow(a,n[i],s,r)}this.selectedValues=n;this.ChangeInfo()}return true};t.JCCatalogBigdataProducts.prototype.RowLeft=function(){var t=0,e="",i=-1,s=BX.proxy_context;if(!!s&&s.hasAttribute("data-treevalue")){e=s.getAttribute("data-treevalue");for(t=0;t<this.treeProps.length;t++){if(this.treeProps[t].ID===e){i=t;break}}if(-1<i&&this.treeRowShowSize<this.showCount[i]){if(0>this.showStart[i]){this.showStart[i]++;BX.adjust(this.obTreeRows[i].LIST,{style:{marginLeft:this.showStart[i]*20+"%"}});BX.adjust(this.obTreeRows[i].RIGHT,{style:this.treeEnableArrow})}if(0<=this.showStart[i]){BX.adjust(this.obTreeRows[i].LEFT,{style:this.treeDisableArrow})}}}};t.JCCatalogBigdataProducts.prototype.RowRight=function(){var t=0,e="",i=-1,s=BX.proxy_context;if(!!s&&s.hasAttribute("data-treevalue")){e=s.getAttribute("data-treevalue");for(t=0;t<this.treeProps.length;t++){if(this.treeProps[t].ID===e){i=t;break}}if(-1<i&&this.treeRowShowSize<this.showCount[i]){if(this.treeRowShowSize-this.showStart[i]<this.showCount[i]){this.showStart[i]--;BX.adjust(this.obTreeRows[i].LIST,{style:{marginLeft:this.showStart[i]*20+"%"}});BX.adjust(this.obTreeRows[i].LEFT,{style:this.treeEnableArrow})}if(this.treeRowShowSize-this.showStart[i]>=this.showCount[i]){BX.adjust(this.obTreeRows[i].RIGHT,{style:this.treeDisableArrow})}}}};t.JCCatalogBigdataProducts.prototype.UpdateRow=function(t,e,i,s){var a=0,o=0,r="",h=0,n="",u={},l=false,c=false,f=false,p=0,d=this.treeEnableArrow,b=this.treeEnableArrow,P=0,B=null;if(-1<t&&t<this.obTreeRows.length){B=BX.findChildren(this.obTreeRows[t].LIST,{tagName:"li"},false);if(!!B&&0<B.length){l="PICT"===this.treeProps[t].SHOW_MODE;h=i.length;c=this.treeRowShowSize<h;n=c?100/h+"%":"20%";u={props:{className:""},style:{width:n}};if(l){u.style.paddingTop=n}for(a=0;a<B.length;a++){r=B[a].getAttribute("data-onevalue");f=r===e;if(BX.util.in_array(r,s)){u.props.className=f?"bx_active":""}else{u.props.className=f?"bx_active bx_missing":"bx_missing"}u.style.display="none";if(BX.util.in_array(r,i)){u.style.display="";if(f){p=o}o++}BX.adjust(B[a],u)}u={style:{width:(c?20*h:100)+"%",marginLeft:"0%"}};if(l){BX.adjust(this.obTreeRows[t].CONT,{props:{className:c?"bx_item_detail_scu full":"bx_item_detail_scu"}})}else{BX.adjust(this.obTreeRows[t].CONT,{props:{className:c?"bx_item_detail_size full":"bx_item_detail_size"}})}if(c){if(p+1===h){b=this.treeDisableArrow}if(this.treeRowShowSize<=p){P=this.treeRowShowSize-p-1;u.style.marginLeft=P*20+"%"}if(0===P){d=this.treeDisableArrow}BX.adjust(this.obTreeRows[t].LEFT,{style:d});BX.adjust(this.obTreeRows[t].RIGHT,{style:b})}else{BX.adjust(this.obTreeRows[t].LEFT,{style:{display:"none"}});BX.adjust(this.obTreeRows[t].RIGHT,{style:{display:"none"}})}BX.adjust(this.obTreeRows[t].LIST,u);this.showCount[t]=h;this.showStart[t]=P}}};t.JCCatalogBigdataProducts.prototype.GetRowValues=function(t,e){var i=0,s,a=[],o=false,r=true;if(0===t.length){for(i=0;i<this.offers.length;i++){if(!BX.util.in_array(this.offers[i].TREE[e],a)){a[a.length]=this.offers[i].TREE[e]}}o=true}else{for(i=0;i<this.offers.length;i++){r=true;for(s in t){if(t[s]!==this.offers[i].TREE[s]){r=false;break}}if(r){if(!BX.util.in_array(this.offers[i].TREE[e],a)){a[a.length]=this.offers[i].TREE[e]}o=true}}}return o?a:false};t.JCCatalogBigdataProducts.prototype.GetCanBuy=function(t){var e=0,i,s=false,a=true;for(e=0;e<this.offers.length;e++){a=true;for(i in t){if(t[i]!==this.offers[e].TREE[i]){a=false;break}}if(a){if(this.offers[e].CAN_BUY){s=true;break}}}return s};t.JCCatalogBigdataProducts.prototype.SetCurrent=function(){var t=0,e=0,i=[],s="",a=false,o={},r=[],h=this.offers[this.offerNum].TREE;for(t=0;t<this.treeProps.length;t++){s="PROP_"+this.treeProps[t].ID;a=this.GetRowValues(o,s);if(!a){break}if(BX.util.in_array(h[s],a)){o[s]=h[s]}else{o[s]=a[0];this.offerNum=0}if(this.showAbsent){i=[];r=[];r=BX.clone(o,true);for(e=0;e<a.length;e++){r[s]=a[e];if(this.GetCanBuy(r)){i[i.length]=a[e]}}}else{i=a}this.UpdateRow(t,o[s],a,i)}this.selectedValues=o;this.ChangeInfo()};t.JCCatalogBigdataProducts.prototype.ChangeInfo=function(){var t=0,e,i=-1,s={},a=true,o="";for(t=0;t<this.offers.length;t++){a=true;for(e in this.selectedValues){if(this.selectedValues[e]!==this.offers[t].TREE[e]){a=false;break}}if(a){i=t;break}}if(-1<i){if(!!this.obPict){if(!!this.offers[i].PREVIEW_PICTURE){BX.adjust(this.obPict,{style:{backgroundImage:"url("+this.offers[i].PREVIEW_PICTURE.SRC+")"}})}else{BX.adjust(this.obPict,{style:{backgroundImage:"url("+this.defaultPict.pict.SRC+")"}})}}if(this.secondPict&&!!this.obSecondPict){if(!!this.offers[i].PREVIEW_PICTURE_SECOND){BX.adjust(this.obSecondPict,{style:{backgroundImage:"url("+this.offers[i].PREVIEW_PICTURE_SECOND.SRC+")"}})}else if(!!this.offers[i].PREVIEW_PICTURE.SRC){BX.adjust(this.obSecondPict,{style:{backgroundImage:"url("+this.offers[i].PREVIEW_PICTURE.SRC+")"}})}else if(!!this.defaultPict.secondPict){BX.adjust(this.obSecondPict,{style:{backgroundImage:"url("+this.defaultPict.secondPict.SRC+")"}})}else{BX.adjust(this.obSecondPict,{style:{backgroundImage:"url("+this.defaultPict.pict.SRC+")"}})}}if(this.showSkuProps&&!!this.obSkuProps){if(0===this.offers[i].DISPLAY_PROPERTIES.length){BX.adjust(this.obSkuProps,{style:{display:"none"},html:""})}else{BX.adjust(this.obSkuProps,{style:{display:""},html:this.offers[i].DISPLAY_PROPERTIES})}}if(!!this.obPrice){o=this.offers[i].PRICE.PRINT_DISCOUNT_VALUE;if(this.showOldPrice&&this.offers[i].PRICE.DISCOUNT_VALUE!==this.offers[i].PRICE.VALUE){o+=" <span>"+this.offers[i].PRICE.PRINT_VALUE+"</span>"}BX.adjust(this.obPrice,{html:o});if(this.showPercent){if(this.offers[i].PRICE.DISCOUNT_VALUE!==this.offers[i].PRICE.VALUE){s={style:{display:""},html:this.offers[i].PRICE.DISCOUNT_DIFF_PERCENT}}else{s={style:{display:"none"},html:""}}if(!!this.obDscPerc){BX.adjust(this.obDscPerc,s)}if(!!this.obSecondDscPerc){BX.adjust(this.obSecondDscPerc,s)}}}this.offerNum=i;this.QuantitySet(this.offerNum)}};t.JCCatalogBigdataProducts.prototype.InitBasketUrl=function(){switch(this.productType){case 1:case 2:this.basketUrl=this.product.addUrl;break;case 3:this.basketUrl=this.offers[this.offerNum].ADD_URL;break}this.basketParams={ajax_basket:"Y",rcm:"yes"};if(this.showQuantity){this.basketParams[this.basketData.quantity]=this.obQuantity.value}};t.JCCatalogBigdataProducts.prototype.FillBasketProps=function(){if(!this.visual.BASKET_PROP_DIV){return}var t=0,e=null,i=false,s=null;if(this.basketData.useProps&&!this.basketData.emptyProps){if(!!this.obPopupWin&&!!this.obPopupWin.contentContainer){s=this.obPopupWin.contentContainer}}else{s=BX(this.visual.BASKET_PROP_DIV)}if(!s){return}e=s.getElementsByTagName("select");if(!!e&&!!e.length){for(t=0;t<e.length;t++){if(!e[t].disabled){switch(e[t].type.toLowerCase()){case"select-one":this.basketParams[e[t].name]=e[t].value;i=true;break;default:break}}}}e=s.getElementsByTagName("input");if(!!e&&!!e.length){for(t=0;t<e.length;t++){if(!e[t].disabled){switch(e[t].type.toLowerCase()){case"hidden":this.basketParams[e[t].name]=e[t].value;i=true;break;case"radio":if(e[t].checked){this.basketParams[e[t].name]=e[t].value;i=true}break;default:break}}}}if(!i){this.basketParams[this.basketData.props]=[];this.basketParams[this.basketData.props][0]=0}};t.JCCatalogBigdataProducts.prototype.SendToBasket=function(){if(!this.canBuy){return}this.InitBasketUrl();this.FillBasketProps();if(this.product&&this.product.id){this.RememberRecommendation(this.obProduct,this.product.id)}BX.ajax({method:"POST",dataType:"json",url:this.basketUrl,data:this.basketParams,onsuccess:BX.delegate(this.BasketResult,this)})};t.JCCatalogBigdataProducts.prototype.RememberRecommendation=function(t,e){var i=BX.findParent(t,{className:"bigdata_recommended_products_items"});var s=BX.findChild(i,{attr:{name:"bigdata_recommendation_id"}},true).value;var a=BX.cookie_prefix+"_RCM_PRODUCT_LOG";var o=getCookie(a);var r=false;var h=[],n;if(o){h=o.split(".")}var u=h.length;while(u--){n=h[u].split("-");if(n[0]==e){n=h[u].split("-");n[1]=s;n[2]=BX.current_server_time;h[u]=n.join("-");r=true}else{if(BX.current_server_time-n[2]>3600*24*30){h.splice(u,1)}}}if(!r){h.push([e,s,BX.current_server_time].join("-"))}var l=h.join(".");var c=new Date((new Date).getTime()+1e3*3600*24*365*10);document.cookie=a+"="+l+"; path=/; expires="+c.toUTCString()+"; domain="+BX.cookie_domain};t.JCCatalogBigdataProducts.prototype.Basket=function(){var t="";if(!this.canBuy){return}switch(this.productType){case 1:case 2:if(this.basketData.useProps&&!this.basketData.emptyProps){this.InitPopupWindow();this.obPopupWin.setTitleBar({content:BX.create("div",{style:{marginRight:"30px",whiteSpace:"nowrap"},text:BX.message("CBD_TITLE_BASKET_PROPS")})});if(BX(this.visual.BASKET_PROP_DIV)){t=BX(this.visual.BASKET_PROP_DIV).innerHTML}this.obPopupWin.setContent(t);this.obPopupWin.setButtons([new e({ownerClass:this.obProduct.parentNode.parentNode.parentNode.className,text:BX.message("CBD_BTN_MESSAGE_SEND_PROPS"),events:{click:BX.delegate(this.SendToBasket,this)}})]);this.obPopupWin.show()}else{this.SendToBasket()}break;case 3:this.SendToBasket();break}};t.JCCatalogBigdataProducts.prototype.BasketResult=function(t){var i="",s="",a="",o=true,r=[];if(!!this.obPopupWin){this.obPopupWin.close()}if("object"!==typeof t){return false}o="OK"===t.STATUS;if(o){BX.onCustomEvent("OnBasketChange");s=this.product.name;switch(this.productType){case 1:case 2:a=this.product.pict.SRC;break;case 3:a=!!this.offers[this.offerNum].PREVIEW_PICTURE?this.offers[this.offerNum].PREVIEW_PICTURE.SRC:this.defaultPict.pict.SRC;break}i='<div style="width: 96%; margin: 10px 2%; text-align: center;"><img src="'+a+'" height="130"><p>'+s+"</p></div>";r=[new e({ownerClass:this.obProduct.parentNode.parentNode.parentNode.className,text:BX.message("CBD_BTN_MESSAGE_BASKET_REDIRECT"),events:{click:BX.delegate(function(){location.href=!!this.basketData.basketUrl?this.basketData.basketUrl:BX.message("BASKET_URL")},this)}})]}else{i=!!t.MESSAGE?t.MESSAGE:BX.message("CBD_BASKET_UNKNOWN_ERROR");r=[new e({ownerClass:this.obProduct.parentNode.parentNode.parentNode.className,text:BX.message("CBD_BTN_MESSAGE_CLOSE"),events:{click:BX.delegate(this.obPopupWin.close,this.obPopupWin)}})]}this.InitPopupWindow();this.obPopupWin.setTitleBar({content:BX.create("div",{style:{marginRight:"30px",whiteSpace:"nowrap"},text:o?BX.message("CBD_TITLE_SUCCESSFUL"):BX.message("CBD_TITLE_ERROR")})});this.obPopupWin.setContent(i);this.obPopupWin.setButtons(r);this.obPopupWin.show()};t.JCCatalogBigdataProducts.prototype.InitPopupWindow=function(){if(!!this.obPopupWin){return}this.obPopupWin=BX.PopupWindowManager.create("CatalogSectionBasket_"+this.visual.ID,null,{autoHide:false,offsetLeft:0,offsetTop:0,overlay:true,closeByEsc:true,titleBar:true,closeIcon:{top:"10px",right:"10px"}})}})(window);function getCookie(t){var e=document.cookie.match(new RegExp("(?:^|; )"+t.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return e?decodeURIComponent(e[1]):undefined}function bx_rcm_recommendation_event_attaching(t){var e=BX.findChildren(t,{className:"bx_rcm_view_link"},true);if(e){for(i in e){BX.bind(e[i],"click",function(t){window.JCCatalogBigdataProducts.prototype.RememberRecommendation(BX(this),BX(this).getAttribute("data-product-id"))})}}}function bx_rcm_get_from_cloud(t,e,i){var s="https://analytics.bitrix.info/crecoms/v1_0/recoms.php";var a=BX.ajax.prepareData(e);if(a){s+=(s.indexOf("?")!==-1?"&":"?")+a;a=""}var o=function(e){if(!e.items){e.items=[]}BX.ajax({url:"/bitrix/components/bitrix/catalog.bigdata.products/ajax.php?"+BX.ajax.prepareData({AJAX_ITEMS:e.items,RID:e.id}),method:"POST",data:i,dataType:"html",processData:false,start:true,onsuccess:function(e){var i=BX.processHTML(e);BX(t).innerHTML=i.HTML;BX.ajax.processScripts(i.SCRIPT)}})};BX.ajax({method:"GET",dataType:"json",url:s,timeout:3,onsuccess:o,onfailure:o})}
/* End */
;; /* /bitrix/templates/aspro_mshop/components/bitrix/sale.basket.basket/main/script.js?14603719095958*/
; /* /bitrix/templates/aspro_mshop/components/bitrix/catalog.bigdata.products/mshop/script.min.js?146037191223411*/

//# sourceMappingURL=page_245c2c10098b3860ef640fb9108a27b6.map.js