# Foodi
<a href="https://play.google.com/store/apps/details?id=com.SaltyNerd.Foodi" target="_blank">
  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" height="80"/>
</a>

## Demo
Foodi is an easy to use mobile app that I've created to inform users about the details of ingredients inside a food product.

![App Demo](Demo/output1.gif)
To learn more about the ingredients inside a food product, users can simply scan the ingredients list or barcode on the product package with the camera built-in on their phones.  Through the use of optical recognition, Foodi will then present users with a list of ingredients that it has found, along with their text descriptions and visuals.

![App Demo](Demo/output2.gif)
Alternatively, users may search for specific ingredients by inputting their names. Foodi supports both food and chemical ingredients.

## Software Stack
- ### React Native
  Foodi was developed using React Native, an open-source mobile application framework created by Facebook. React Native is advertised as 'learn once write anywhere', which is mainly the reason I've chosen to use it for my first mobile app. If you are familiar with the JavaScript library React, React Native is an extension of React for mobile development, so it's another reason to use it for cross-platform mobile app development.
- ### Google's Firebase Mobile ML Kit
  This is an extremely powerful SDK that brings Google's machine learning expertise to Android. Mobile ML Kit comes with pre-trained neural nets to perform optical barcode and text recognition, hence, experience or deep knowledge of machine learning is not required to get started. The SDK was implemented into into the project with the React Native Firebase NPM module.
- ### Open Food Facts API
  A free food product database that has over 1.3 million products listed including information such as ingredients, allergens, nutrition facts, and more. After the product barcode is obtained, Foodi queries this database for the ingredients corresponding to the product.
- ### Wikipedia Search API
  It needs no introduction, but nonetheless, Wikipedia is a free online encyclopedia, created and edited by volunteers around the world. The detailed information of each ingredient is obtained from here, through the use of its search API.
- ### Express.js Backend RESTful API
  Express is a back end web application framework for Node.js, and it's also what's used to build Foodi's backend. Multimedia data such as text descriptions and visuals of ingredients are extracted from Wikipedia and saved on the server after post processing. The database is then queried through the REST architectural style API constructed with Express from the frontend React Native app.
