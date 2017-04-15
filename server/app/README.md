# Mersal Chat Server

## Installation

### Mongodb

    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org

### Nodejs

    sudo npm cache clean -f
    sudo npm install -g n
    sudo n stable

    sudo ln -sf /usr/local/n/versions/node/<VERSION>/bin/node /usr/bin/node

## Generating docs

    cd server
    apidoc -i app/lib/routes/api
    
## Running tests
    
    cd server/app/lib
    ../../node_modules/mocha/bin/mocha
    
## Charts
  
  from http://www.chartjs.org/docs/#line-chart-introduction
