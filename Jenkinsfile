pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO = '288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo'
        IMAGE_NAME = 'cicsample'
        SSH_KEY = credentials('app-ssh-key') // Jenkins credential (Secret File or SSH)
        EC2_USER = 'ubuntu'
        EC2_HOST = '13.222.171.194'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github_token', 
                    url: 'https://github.com/harinins28/CI_CD-Pipeline-AWS.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image (no cache)..."
                    bat "docker build --no-cache -t ${IMAGE_NAME}:latest ."
                }
            }
        }


        stage('Login to AWS ECR') {
            steps {
                withAWS(credentials: 'AWS_Credential', region: "${AWS_REGION}") {
                    script {
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
                    echo "Tagging and pushing image..."
                    bat """
                        docker tag ${IMAGE_NAME}:latest ${ECR_REPO}:latest
                        docker push ${ECR_REPO}:latest
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'app-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    bat '''
                        echo Deploying to EC2...
                        set PEM_FILE=%SSH_KEY%
                        echo Using key at %PEM_FILE%

                        "C:\\Program Files\\Git\\usr\\bin\\ssh.exe" -i "%PEM_FILE%" -o StrictHostKeyChecking=no ubuntu@13.222.171.194 ^
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

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed.'
        }
    }
}
