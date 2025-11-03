pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO = '288434313151.dkr.ecr.us-east-1.amazonaws.com/ci-cd-sample-repo'
        IMAGE_NAME = 'cicsample'
        SSH_KEY = credentials('app-ssh-key') // Add your EC2 PEM key as Jenkins credential (Secret File or SSH)
        EC2_USER = 'ubuntu'
        EC2_HOST = '34.226.195.199'
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
                    echo "Building Docker image..."
                    bat "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withAWS(credentials: 'AWS_Credential', region: "${AWS_REGION}") {
                    script {
                        bat """
                            aws ecr get-login-password --region ${AWS_REGION} \
                            | docker login --username AWS --password-stdin ${ECR_REPO}
                        """
                    }
                }
            }
        }

        stage('Tag & Push to ECR') {
            steps {
                script {
                    echo "Tagging image..."
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
                        chmod 600 $SSH_KEY
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@34.226.195.199 "
                            cd /var/www/html &&
                            git pull origin main
                        "
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
