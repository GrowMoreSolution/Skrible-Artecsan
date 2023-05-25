(function () {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, SweetAlert, restaurant, core) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.$state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;
		//that.subscription_type_id = restaurant.data.info.subscription_type_id;
		that.faq_data = [
						{q:"How do I add another user?", a:"From the navigation bar on the left select Administrator > Create/Delete/Modify User > Add New" },
						
						{q:"How do I add another restaurant to my account?", a:"From the navigation bar on the left select Select Restaurant > Add New Restaurant" },
						
						{q:"How do I change my password?", a:"In the upper left corner you should see your name. Select your name and a list should appear that says Account Settings and Logout. Select Account Setting to change your name and password." },
						
						{q:"Can I merge restaurant reports if I have multiple restaurants?", a:"Merging reports is part of our paid Enterprise version which is due to be released later this year" },
						
						{q:"How do I change my subscription level?", a:"Currently you will need to contact the Skrible team at <code>sales@getskrible.com</code> with your request" },
						
						{q:"Do you guys have a contact phone number? ", a:"Skrible is in the process of growing and adding new employees which includes a team dedicated to customer service & support. For now the quickest way to reach us is by email at <code>sales@getskrible.com</code>. A representative should be in contact with you within 1-24 hours." },
						
						{q:"How do I setup my orders to be automatically sent to my vendors?", a:"In order to deliver your orders to your vendors you must make sure that your sales rep's email address is added to the correct vendors account. To do this you may visit the navigation bar on the left and select Inventory>Food or Alcohol>Add/Edit New Vendor. Once inside you can select Edit next to the desired vendor's name. Note: Edit is only active for vendors who are selected. Once you select Edit you will see three email options which includes Primary, Seconday 1 and Seconday 2. These email slots are the recipients of your orders. For best results we advise that in addition to your vendors, you also add your email address as a secondary confirmation that the order was successfully sent. In addition we also advise that you request a confirmation from your vendor after the order is received." },
						
						{q:"How do I automatically send my orders to my vendors?", a:"After your vendors email address has been added to the vendors profile, you simply have to select 'Save and Send' whenever you create a new order. This will automatically email the orders to all email address listed under each vendors profile." },
						
						{q:"What is Yield?", a:"Yield is the amount of content or usable value that you get from a food item. For example, a box of noodles has a 100% yield because all the noodles are usable however pound of apples will include a core, stem and seeds which are unusable. This might reduce your usable apple amount down to 3/4th of a pound which is defined as my Yield %. Artecsan has pre-loaded dozens of Yield amounts but also lets the user freely add their own Yield percentages and descriptions." },
						
						
						{q:"I can't find some of my POS items on my reports?", a:"<article style='display: block'><p>Your POS items will not appear on reports if they are inactive, incorrectly categorized, unmapped or never added. You may check for your items in three locations. First visit your menu setup screen by going to Inventory>Food or Alcohol>Modify Menu. We first want to make sure the item is part of a mapped recipe. Scroll down the list until you see the menu item that contains the ingredient that you are searching for. Once you find the recipe, make sure it is mapped to a recipe that you created. If it is not, you may select the dropdown list, find the item and save it as mapped. The item should now show up in your reports.</p><p>If you mapped the item and it still does not show up on your reports you will need to double check the recipe to make sure the item is included in the recipe. To check the recipe simply select the Create Food/Alcohol Item in the top left corner of the same screen. This will take you to the Menu setup screen where you can verify the recipes.</p><p>If you do not see the recipe in your Menu list, you will have to create the recipe then map it. After this step the item should show up in your reports. If you do not see the menu item or your Create a Menu page, the item may have been mis-categorized. To check, please go back to the Create a Menu page where you will see a dropdown list labeled 'Status'. Select Inactive. Any items in this list will not show up in your reports because the status is inactive unless the ingredient is included on an active menu item. To make the item active and appear on report you may change the item status from inactive to active.</p><p>If you have no luck there you may re-visit the mapping screen by selecting Reports>Menu Item Mappings. Once inside you will see a drop down list on the top left labeled 'Category'. In this dropdown list you will see four options labeled Alcohol, Food, Archived and Other. View each list to see if your items have been mis-categorized. For example: if you're working with Food but your item appears in Liquor, that item will not show on your food reports. To fix this, simply move the item to its correct category by selecting the 'Move To' drop down list which is next to the item name. Select where you want the item to go followed by 'Move Selected Item'.</p><p>If you still can't locate the missing item you may want to make sure the item is added to your inventory list by going to Inventory>Food or Alcohol>New Order. Once there you can select the vendor that you purchase the item from, then search for the item in the dropdown list. If you do not see the item in the dropdown list you may select 'Add new' and add the item to your list.</p><p>If you still do not see the item please contact us at <code>sales@getskrible.com</code></p></article>" },
						
						{q:"How do I create a new food or alcohol order?", a:"Select Inventory>Food or Alcohol>New Food Order. Once inside simply select the + symbol on the left. This will add rows for you to complete your orders. Each row will contain a vendor, order item, amount ordered and size. Once your list of items ordered is complete simply hit Save or Save and Send. If you select Save and Send your order will be sent directly to the email addresses you attached to each vendors account. If you did not attach an email, then no emails will be delivered but your order will be saved." },
						
						{q:"Can I add more than one vendor to a single order?", a:"Yes. Artecsan sorts and combines the order by the vendors name so feel free to list as many items as vendors as you like." },
						
						{q:"I received a new order, how do I confirm that I received it in Artecsan?", a:"From the navigation bar on the left you will select Inventory>Food or Alcohol > Confirm Delivery. Once inside you will need to enter the invoice amount, date and invoice number. The invoice amount must match your Order amount. If not, you may select Edit and update the details so that they match the invoice. Once they match, select 'Save' and this will take you back to the Order Summary screen. From there you may reenter the amount, date and invoice number then select both toggle buttons labeled 'Approve' and 'Confirm Delivery'. Once your order is Approved and Confirmed simply select 'Confirm and Save' at the bottom." },
						
						{q:"I can't find my orders in any of my reports?", a:"After creating an order, you must also confirmed that the order was received. From the navigation bar on the left, simply select Inventory>Food or Alcohol > Confirm Delivery. Once inside you will need to enter the invoice amount, date and invoice number. The invoice amount must match your Order amount. If not, you may select Edit and update the details so that they match the invoice. Once they match, select 'Save' and this will take you back to the Order Summary screen. From there you may reenter the amount, date and invoice number then select both toggle buttons labeled 'Approve' and 'Confirm Delivery'. Once your order is Approved and Confirmed simply select 'Confirm and Save' at the bottom." },
						
						{q:"How do I do an inventory Audit using Artecsan?", a:"<article style='display: block'><p>Artecsan inventory platform does not yet include an app for mobile use therefore the best way to do inventory is to print an inventory sheet, note your count on paper then enter the count into Artecsan. </p><p>Our goal is to have a fully functional app within the near future.</p><p>For alcohol, the count must consist of full bottles counted as full and opened bottles weighed in ounces. For example, if you have 5 bottles of Greygoose on-hand and 3 of the bottles are opened your count would appear as 2 Full and the individual weights of the remaining 3 bottles.</p><p>For food, the count must consist of unopened cases counted as full and opened cases weighed in the unit of delivery. For example, an opened box of steaks delivered in pounds would be placed on a scale and weighed in pounds. </p><p>If you have pre-prep'd food batches, the items should be counted in estimated points. Example: a pre-prep'd batch of beans that typically makes 1 it appears to you have 1/2 gallon on-hand. You would not the estimated content amount of .5 on your report.</p><p>To get started, from the navigation bar on the left simply select Inventory>Alcohol or Food>Begin Alcohol Inventory Count. The next option you see should be Full or Adjustment. With a full audit you must count everything. Anything left unaccounted will default to zero. For an adjustment you only need to count specific items and no other items will be affected. Once inside you may begin entering your data.</p><p>To begin entering your data be sure to enter the date your audit began as the beginning date. Once your data entry is complete you may select 'Save' followed by the 'COS Report' button to view the results and 'Final Save' once your audit is fully completed. Note: After final save your audit cannot be changed.</p></article>" },

						{q:"How do I merge items?", a:"<article style='display: block'><p>Artecsan allows users to attach one item to another and create a primary and secondary items. The benefit of this is to create clean reports. The merge reporting should be used if you purchase the same item from multiple vendors, if you use the same item but from different manufacturers, if you use the same item but they are two different sizes. The primary should be the item you purchase the most frequently. Note: a secondary items cannot be used a both a secondary and primary.</p><p>This task is best done when creating a new order. To create a primary and secondary item go to the navigation bar on the left and select Inventory>Food or Alcohol>Order. Select the Vendor, then in the next column select the item you wish to make a secondary item or select add new. In the pop screen you will a column labeled 'Primary Item'. From the drop down list select the 'Primary Item' that you want to attach the new item to. Complete the rest of the information, select Save and your done.</p><p>Note: Secondary items will only show in the purchases and on-hand section. You will not be able to add these items to menus or see them on most reports. If you remove the item from the Secondary column, most reports will return to displaying the item.</p></article>" },
						
						{q:"Is my On-Hand Report live?", a:"Your on-hand report is based on sales up thru the closing of the most recent business day. If you compare the on-hand report to your actual on-hand prior to any transactions taking place on the current business day, the on-hand report and your actual on-hand inventory should match. Example: if you open at 11am then the on-hand inventory numbers should match your actual on-hand inventory numbers assuming all purchased were received." },
						
						{q:"What is the CompGroup Report?", a:"The CompGroup report allows you to view how restaurants within your same competitive grouping is performing compared to your restaurant. For example, if you're a steakhouse, you will see the daily sales of other participating steakhouse without ever knowing the name of the steakhouses or their exact location. You can also see their budget and how it compares to yours as well as dozens of other data points that will be coming soon." },
						
						{q:"How do I view my final or previous cost of sales reports?", a:"<article style='display: block'><p>To review previous cost of sales reports you must select the date the audits were performed. You can select any date range even if other audits are in the middle. For example, if you do a monthly audit but you still want to see your annual audit dated as of January 1 2018 thru January 1 2019, simply select the dates, select Search and your Annual audit will calculate.</p><p>The view your previous cost of sales reports simply select Reports>Cost of Sales Summary and select the date range of the reports that you would to view. Finally hit select and the table at the bottom should populate data.</p></article>" },
						
						{q:"Things to know about your Cost of Sales Report", a:"<article style='display: block'><p>Artecsan is able to merge items that are used as substitutes and will only show the primary items. For example, if you purchase a liter bottle of Greygoose on a regular basis but the vendor runs out liter size bottles and sends over 750ml size, you may manually designate the 750ml size bottle as a substitute item and Artecsan will calculate the cost as a combined total using a weighted average for unit cost.</p><p>All item weights are converted to points. Example - if you enter 2 full and 3 partial bottle weights during a full inventory audit, you might see 3.1 as a total inventory count. By converting to points it becomes easier to read the numbers.</p><p>Under food you will see a column labeled 'Batch Adjustment'. This column represents inventory items that are pre-mixed or pre-prep'd batches. For example, a full batch of tomato soup might contain a dozen tomatoes. When you enter 1 full batch of tomato soup on your inventory report it will show the 12 tomatoes in the 'batch adjustment' column.</p><p>+/- Unit variance column represents units over or short. This is the column where you want to focus your efforts. This column will tell you exactly how many items are potentially missing.</p></article>" },
						
						{q:"Things to know about your Purchases vs Cost Report", a:"Your purchase vs cost report is a great way to easily identify a potential problem. If you're restaurant is purchasing more than it sells, you have a potential problem."}	
						];
		
		
		that.faq_questionare = [
												
							];
		
		that.faq_answers = [];

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });
		
        that.$onInit = function () {
			/*that.core.getRefbooks().then(function (res1) {
				that.all_analytics_questionare = res1.analytics_questionare;
				that.change_qns(true);		
			});*/
        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'SweetAlert', 'restaurant', 'core'];

    angular.module('inspinia').component('faq', {
        templateUrl: 'js/components/faq/faq.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
