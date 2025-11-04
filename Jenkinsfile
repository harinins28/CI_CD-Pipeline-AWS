pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO = '288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo'
        IMAGE_NAME = 'cicsample'
        SSH_KEY = credentials('app-ssh-key')
        EC2_USER = 'ubuntu'
        EC2_HOST = '34.204.15.178'
    }

    options {
        ansiColor('xterm')          // adds colors to logs
        timestamps()                // adds timestamps to each line
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()   // avoid overlapping builds
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    echo "\u001B[36mFetching code from GitHub repository...\u001B[0m"
                    git branch: 'main',
                        credentialsId: 'github_token', 
                        url: 'https://github.com/harinins28/CI_CD-Pipeline-AWS.git'
                    echo "\u001B[Code checkout completed.\u001B[0m"
                }
            }
        }

        stage('🐳 Build Docker Image') {
            steps {
                script {
                    echo "\u001B[36mBuilding Docker image (no cache)...\u001B[0m"
                    bat "docker build --no-cache -t ${IMAGE_NAME}:latest ."
                    echo "\u001B[Docker image built successfully.\u001B[0m"
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withAWS(credentials: 'AWS_Credential', region: "${AWS_REGION}") {
                    script {
                        echo "\u001B[36mAuthenticating Docker with AWS ECR...\u001B[0m"
                        bat """
                            aws ecr get-login-password --region ${AWS_REGION} ^
                            | docker login --username AWS --password-stdin ${ECR_REPO}
                        """
                        echo "\u001B[AWS ECR login successful.\u001B[0m"
                    }
                }
            }
        }

        stage('Tag & Push Image to ECR') {
            steps {
                script {
                    echo "\u001B[36mTagging and pushing Docker image to ECR...\u001B[0m"
                    bat """
                        docker tag ${IMAGE_NAME}:latest ${ECR_REPO}:latest
                        docker push ${ECR_REPO}:latest
                    """
                    echo "\u001B[Image successfully pushed to ECR.\u001B[0m"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'app-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    script {
                        echo "\u001B[36mStarting deployment on EC2 instance: ${EC2_HOST}\u001B[0m"
                        bat """
                            echo Using key at %SSH_KEY%
                            "C:\\Program Files\\Git\\usr\\bin\\ssh.exe" -i "%SSH_KEY%" -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} ^
                            "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO} && \
                            docker stop ${IMAGE_NAME} || true && \
                            docker rm -f ${IMAGE_NAME} || true && \
                            docker rmi ${ECR_REPO}:latest || true && \
                            docker pull ${ECR_REPO}:latest && \
                            docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${ECR_REPO}:latest"
                        """
                        echo "\u001B[Deployment completed successfully on EC2.\u001B[0m"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "\u001B[Deployment pipeline completed successfully!\u001B[0m"
        }
        failure {
            echo "\u001B[Deployment failed. Check above logs for details.\u001B[0m"
        }
    }
}
