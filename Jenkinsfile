pipeline {
    agent any

    options {
        // These will work on all Jenkins versions
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO = '288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo'
        IMAGE_NAME = 'cicsample'
        SSH_KEY = credentials('app-ssh-key')
        EC2_USER = 'ubuntu'
        EC2_HOST = '34.204.15.178'
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                        timestamps {
                            echo "\u001B[1;34m📦 Checking out source code...\u001B[0m"
                            git branch: 'main',
                                credentialsId: 'github_token',
                                url: 'https://github.com/harinins28/CI_CD-Pipeline-AWS.git'
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "\u001B[1;36m🐳 Building Docker image (no cache)...\u001B[0m"
                    bat "docker build --no-cache -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                script {
                    echo "\u001B[1;33m🔐 Logging into AWS ECR...\u001B[0m"
                    withAWS(credentials: 'AWS_Credential', region: "${AWS_REGION}") {
                        bat """
                            aws ecr get-login-password --region ${AWS_REGION} ^
                            | docker login --username AWS --password-stdin ${ECR_REPO}
                        """
                    }
                }
            }
        }

        stage('Tag & Push to ECR') {
            steps {
                script {
                    echo "\u001B[1;32m📤 Tagging & pushing Docker image...\u001B[0m"
                    bat """
                        docker tag ${IMAGE_NAME}:latest ${ECR_REPO}:latest
                        docker push ${ECR_REPO}:latest
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    echo "\u001B[1;35m🚀 Deploying container on EC2 instance...\u001B[0m"
                    withCredentials([sshUserPrivateKey(credentialsId: 'app-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        bat '''
                            echo Deploying to EC2...
                            set PEM_FILE=%SSH_KEY%
                            echo Using key at %PEM_FILE%

                            "C:\\Program Files\\Git\\usr\\bin\\ssh.exe" -i "%PEM_FILE%" -o StrictHostKeyChecking=no ubuntu@34.204.15.178 ^
                            "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo && \
                            docker stop cicsample || true && \
                            docker rm -f cicsample || true && \
                            docker rmi 288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo:latest || true && \
                            docker pull 288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo:latest && \
                            docker run -d --name cicsample -p 3000:3000 288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo:latest"
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo '\u001B[1;32m✅ Deployment successful!\u001B[0m'
        }
        failure {
            echo '\u001B[1;31m❌ Deployment failed.\u001B[0m'
        }
    }
}
