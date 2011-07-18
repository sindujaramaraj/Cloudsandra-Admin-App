Cloudsandra Admin Console
---------------------------------
Software Used
Server: Node.js with express and nowjs
UI: jQuery library
Helper library:  node-cloudsandra

Project is deployed on Heroku.
Heroku URL: afternoon-warrior-508.herokuapp.com
Access heroku link with Token/Account id

Setting up on local system
1) Install nodejs
2) Install npm
3) Use npm to install express and nowjs
4) In the project folder run command "node adminserver.js"
5) This will start the server at port 3000
6) To use another port open adminserver.js and change line 8 for any port number
7) localhost:port will launch the application

Create Column Family
1) Login into the system
2) See the Add Column Family Button on the right
3) Click on the button to open and enter column family details
4) Click ok to save
5) The UI refreshes and you can see the tabs for Column and Data
6) Add any number of Column Familes. They are displayed on the left and choose any Column Family to see their data

Create Column
1) Under Column Family Column and Data tabs are displayed
2) Click on Add Column to add a column
3) The table will be updated with the added column
4) To edit a column, click on the corresponding row in the table
5) The row is highlighted and a edit dialog opens
6) Click Ok to save changes

Add Data
1) Click on Data tab. This loads the data for the Column Family
2) Click on Add Row to add rows
3) The dialog asks for rowkey and name value details
4) Click Ok and you can see the data displayed
5

Edit/Delete Data
1) Click on the rowkey
2) This will show two buttons -  Edit and Delete
3) Use edit to add new column data for row and edit existing data. When the key is same as another existing data then it will be overriden
4) Click on delete to remove all columns from the row

Delete single column from Row
1) Click on the column in the row you want to delete
2) A trash icon is shown
3) Clicking on the trash icon will remove that particular column data from the row

Delete Column Family
1) Use the button on the top right "Delete Column Family" to delete any Column Family

Refresh
1) Data refresh is provided at Column Family level and data level 

TODO
1) Super column support
2) Pagination for data
3) UI enhancements