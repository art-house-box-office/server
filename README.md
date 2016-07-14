# Art House Box Office Server

API server for the Art House Box Office project.

## Installation  
Clone the repository and run:

    npm install  
Set the following environment variables:

- MONGO_URI -- should point to a mongoDB connection.  Ex:  mongodb://localhost/ahbo
- APP_SECRET -- a string used to generate tokens
- PORT -- what port you would the app to run on.  The default if none is specified is 9000.  This can also be specified in the command line as an option to index.js.

Then, run:

    npm run start:watch

The default user is Admin and the default password is 'password'. You are encouraged to create a new user, set it as admin, and delete Admin immediately.

## Things you can do with the REST API

[VALIDATE](#validate)  
[SIGN UP](#signup)  
[SIGN IN](#signin)  

___

<a name="signup"></a>  
#### SIGN UP  
__URL:__ /api/signup  
__Method:__ POST
__Description:__ Creates a new user and returns a token. The token must be included in all API calls in the header as the VALUE for the KEY 'token'.  
__Authorized roles:__ N/A  
__Inputs:__

- username  *--the username must be unique. an error will be returned if the username if found in the database.*
- password  *--The password is encrypted before saved to database.*
- roles (OPTIONAL)  *--an admin role can only be assigned with the CREATE USER or UPDATE USER end points*

__Outputs:__

- token

___
