This a draft implementation of Akvelon Take Home coding task (AppCenter) - https://gist.github.com/sgrebnov/6fae277243e96d2c27aaaf93362eae0f
This is done using Typescript/Node.js
The script works with AppCenter API: gets branch names for some app, queues builds against those branches and monitors them, then displays results.
Requirements:
1. Node.js installed - nodejs.org
2. Git installed - https://git-scm.com/
3. An account on AppCenter (appcenter.ms), configured app(s) and API token(s).


Usage:
1. Clone the repository using Git: git clone https://github.com/atrutnev/AppCenterHomeTask.git
2. Go to the directory with a local copy of the repository using command prompt and run: npm install
3. Run the script: ts-node QueueBuildsAndMonitor.ts "<owner_name>" "<app_name>" <token>
   Please see the AppCenter documentation on how to create an API token and find app owner name and app name:
   https://docs.microsoft.com/ru-ru/appcenter/api-docs/.
   
Example of output:
D:\Study\TypeScript\AppCenterHomeTask>ts-node QueueBuildsAndMonitor.ts "atrutnev" "Test" <token_hidden>
Using provided parameters: app_owner - atrutnev, app_name - Test
Found 3 branches: dev/v-altrut/add-appcenter-sdk,dev/v-altrut/add-packaging-project,master
The build with id 53 has been queued for the branch dev/v-altrut/add-appcenter-sdk
The build with id 54 has been queued for the branch dev/v-altrut/add-packaging-project
The build with id 55 has been queued for the branch master
Starting to monitor 3 builds...
dev/v-altrut/add-appcenter-sdk build failed in 36 seconds. Link to build logs: https://api.appcenter.ms/v0.1/apps/atrutnev/Test/builds/53/logs
dev/v-altrut/add-packaging-project build succeeded in 173 seconds. Link to build logs: https://api.appcenter.ms/v0.1/apps/atrutnev/Test/builds/54/logs
master build failed in 89 seconds. Link to build logs: https://api.appcenter.ms/v0.1/apps/atrutnev/Test/builds/55/logs
  
 ToDo:
 1. Implement a strong logic for parameters validation.