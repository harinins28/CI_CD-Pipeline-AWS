pipeline {
  agent any
  environment {
    AWS_REGION = 'us-east-1'      // change to your region
    ECR_REG = '288434313151.dkr.ecr.ap-south-1.amazonaws.com'
    REPO = 'ci-cd-sample-repo'
    IMAGE = "${ECR_REG}/${REPO}"
    SSH_CRED_ID = 'app-ssh-key'   // Jenkins SSH credential id
    EC2_USER = 'ubuntu'
    EC2_HOST = '54.197.27.87'
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build & Test') {
      steps {
        bat 'npm ci'
        bat 'npm start & sleep 2; npm test'
      }
    }
    stage('Docker Build') {
      steps {
        bat 'docker build -t cicsample:latest .'
      }
    }
    stage('Login to ECR & Tag') {
      steps {
        // login; requires aws creds on Jenkins machine
        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REG}"
        bat "docker tag cicsample:latest ${IMAGE}:latest"
      }
    }
    stage('Push to ECR') {
      steps {
        bat "docker push ${IMAGE}:latest"
      }
    }
    stage('Deploy to EC2') {
      steps {
        // SSH to EC2 and run docker pull & run
        sshagent (credentials: [SSH_CRED_ID]) {
          bat """
            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} \\
            "docker pull ${IMAGE}:latest && docker stop cicsample || true && docker rm cicsample || true && docker run -d --name cicsample -p 3000:3000 ${IMAGE}:latest"
          """
        }
      }
    }
  }
  post {
    success { echo 'Pipeline succeeded' }
    failure { echo 'Pipeline failed' }
  }
}
