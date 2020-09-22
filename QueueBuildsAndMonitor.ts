//Common variables. Mostly get from script parameters.
const ownerName: string = process.argv[2];
const appName: string = process.argv[3];
const token: string = process.argv[4];
const appCenterURL = `https://api.appcenter.ms/v0.1/apps/${ownerName}/${appName}`;
const axios = require('axios');
axios.defaults.headers.common['X-API-Token'] = `${token}`;

//This function displays script usage information in case of incorrect parameters.
function ShowUsage () {
    console.log("Usage: ts-node QueueBuildsAndMonitor.ts \"<owner_Name>\" \"<app_Name>\" <token>. See docs for more information:")
    console.log("https://docs.microsoft.com/ru-ru/appcenter/api-docs/")
}

//The function displays build results using properties of the build object
function DisplayBuildResult (build) {
    let buildStartTime = new Date(build.startTime);
    let buildFinishTime = new Date(build.finishTime);
    //Convert build duration to seconds.
    let buildDuration = Math.round((buildFinishTime.valueOf() - buildStartTime.valueOf()) / 1000);
    let buildLogs = `${appCenterURL}` + `/builds/${build.id}/logs`;
    console.log(`${build.sourceBranch} build ${build.result} in ${buildDuration} seconds. Link to build logs: ${buildLogs}`);
}

//The function is a timeout between requests to API during the monitoring
function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

//The function gets branches objects from API and returns their names 
const GetBranchNames = async () => {
    try {
        const response = await axios.get(`${appCenterURL}` + '/branches')
        let branchNames = [];
        response.data.forEach(element => {
            branchNames.push(element.branch.name);
        });
        return branchNames;
    } catch (err) {
        console.error("Failed to get branch names:" + err.message);
    }        
};

//The function queues builds for provided branch names using API POST request and returns their id's to monitor further
const QueueBuild = async (branchNames:string []) => {
    let buildIds: number[] = [];
    for (let branch of branchNames) {
        let sourceBranch: string = branch;
        if (branch.includes('/')) {
            sourceBranch = branch.replace(/\//g, '%2F')
        }
        try {
            const response = await axios.post(`${appCenterURL}` + `/branches/${sourceBranch}/builds`);
            buildIds.push(response.data.id);
            console.log(`The build with id ${response.data.id} has been queued for the branch ${branch}`);
        } catch (err) {
            console.error(`Failed to queue a build for the branch ${branch}` + err.message);
        }
    }
    return buildIds;
};

//The function gets a build object from API and returns it to analyze status and display build results
const GetBuildById = async (id) => {
    const response = await axios.get(`${appCenterURL}` + `/builds/${id}`)
    return response.data
}

//The function get status of queued builds from API in a loop with a timeout of 15 secons between requests
const MonitorBuilds = async (buildIds: number[]) => {
    while (buildIds.length > 0) {
        for (let id of buildIds) {
            await GetBuildById(id)
            .then(build => {
                if (build.status === 'completed') {
                    DisplayBuildResult(build);
                    let index = buildIds.indexOf(build.id);
                    buildIds.splice(index, 1);
                }
            })
            .catch(error => console.error(`Failed to get data for build id ${id}` + error.message))
        }
        await sleep(15000);
    }
}

//The function does main work
const QueueAndMonitor = async () => {
    let branches: string[] = await GetBranchNames();
    if (!branches) {
        return
    }
    console.log(`Found ${branches.length} branches: ${branches}`);

    let buildIds: number[] = await QueueBuild(branches);
    if (!buildIds) {
        return
    }
    console.log(`Starting to monitor ${buildIds.length} builds...`);
    await MonitorBuilds(buildIds);
}

//Parameters validation
//TODO: need to implement more strong validation logic.
if (process.argv.length !== 5) {
    console.log("Incorrect parameters provided.");
    ShowUsage();
    process.exit(1);
}

console.log(`Using provided parameters: app_owner - ${ownerName}, app_name - ${appName}`);
QueueAndMonitor()
