pipeline{
  agent any 

  triggers {
        pollSCM('* * * * *') 
  }

  stages{
    stage("pull"){
      steps{
       git branch: 'main', credentialsId: 'a2887c96-9ca5-4a7a-8f62-709d033369af', url: 'https://github.com/kirandhurve18/project-new-frontend.git'
      }
    }

    stage('Build') {
            steps { 
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'docker_hub')]) {
                sh '''
                echo "$docker_hub" | docker login -u "kirand18" --password-stdin
                docker build --no-cache  -t frontend:${BUILD_NUMBER} .
                docker tag frontend:${BUILD_NUMBER} kirand18/frontend:${BUILD_NUMBER}
                docker push kirand18/frontend:${BUILD_NUMBER}
                '''
                }                
            }
         }

  stage('Deploy') {
            steps {           
                withCredentials([file(credentialsId: 'gcp-key', variable: 'gcpkey')]) {
                sh '''
                gcloud auth activate-service-account --key-file=$gcpkey
                gcloud config set project sigma-icon-480904-m9
                gcloud container clusters get-credentials autopilot-cluster-1 --region us-central1 --project sigma-icon-480904-m9 
                sed -i "s/frontend:1/frontend:${BUILD_NUMBER}/g" K8/frontend-deployment.yaml
                kubectl apply -f K8/frontend-deployment.yaml
                kubectl apply -f K8/frontend-service.yaml
                '''
        }
    }
}
    
  }
}
