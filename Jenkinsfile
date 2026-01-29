pipeline{
  agent any 

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
                docker build -t frontend:latest .
                docker tag frontend:latest kirand18/frontend
                docker push kirand18/frontend
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
                gcloud container clusters get-credentials cluster-1 --zone us-central1-a --project sigma-icon-480904-m9
                kubectl apply -f K8/frontend-deployment.yaml
                kubectl apply -f K8/frontend-service.yaml
                '''
        }
    }
}
    
  }
}
