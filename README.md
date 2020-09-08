# Foodi
<a href="https://play.google.com/store/apps/details?id=com.SaltyNerd.Foodi" target="_blank">
  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" height="80"/>
</a>

## Demo
Foodi is a mobile app I created to provide users with detailed information about ingredients inside a food product.

![App Demo](Demo/output1.gif)
To learn more about what is inside a food product, users may scan the ingredients list on the product packaging with the camera built-in on their phones. Also through the use of optical recognition, users may find and scan the barcode on the packaging for ingredient details.

![App Demo](Demo/output2.gif)
Alternatively, users may search for a specific ingredient by inputting its name. Both food ingredients and chemical ingredients are supported.

## Software Stack
- ### React Native
  Foodi was developed using React Native, an open-source mobile application framework created by Facebook. React Native is advertised as 'learn once write anywhere', which is mainly the reason I've chosen to use it for my first mobile app. If you are familiar with the JavaScript library React, React Native is an extension of React for mobile development, so it's another reason to use it for cross-platform mobile app development.
- ### Google's Firebase Mobile ML Kit
  This is an extremely powerful SDK that brings Google's machine learning expertise to Android. Mobile ML Kit comes with pre-trained neural nets to perform optical barcode and text recognition, hence, experience or deep knowledge of machine learning is not required to get started. The SDK was implemented into into the project with the React Native Firebase NPM module.
- ### Open Food Facts API
  A free food product database that has over 1.3 million products listed including information such as ingredients, allergens, nutrition facts, and more. After the product barcode is obtained, Foodi queries this database for the ingredients corresponding to the product.
- ### Wikipedia Search API
  It needs no introduction, but nonetheless, Wikipedia is a free online encyclopedia, created and edited by volunteers around the world. The detailed information of each ingredient is obtained from here, through the use of its search API.
- ### React Native Fetch API
  React Native provides the Fetch API for developer's networking needs. Thanks to this, Foodi doesn't require a back-end server to act as a middleman between the databases and its users. Data can be easily requested on demand, from the end user's device, directly to the appropriate database, with greater efficiency.
