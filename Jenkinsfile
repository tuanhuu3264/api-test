pipeline {
    agent any
    
    options {
        skipDefaultCheckout()
    }

    parameters {
        string(name: 'GIT_URL', defaultValue: 'https://github.com/tuanhuu3264/api-test.git', description: 'Git repo URL')
        string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Git branch')
    }

    environment {
        IMAGE_TAG = "latest"
        IMAGE = "tuanhuu3264/api-test-k8s:${IMAGE_TAG}"
        GITOPS_REPO = "git@github.com:tuanhuu3264/devops_k8s.git"
    }

    stages {
        stage('Checkout App') {
            steps {
                checkout(
                    changelog: false,
                    poll: false,
                    scm: [
                        $class: 'GitSCM',
                        branches: [[name: params.GIT_BRANCH]],
                        userRemoteConfigs: [[url: params.GIT_URL]]
                    ]
                )
                stash name: 'sources', includes: '**', excludes: '**/.git,**/.git/**'
            }
        }

        stage('Build & Push with Kaniko') {
            agent {
                label 'docker-build'
            }
            steps {
                unstash 'sources'
                container('kaniko') {
                    sh '''
                    /kaniko/executor \
                        --dockerfile=./api/Dockerfile \
                        --context=dir:///workspace \
                        --destination=$IMAGE \
                        --skip-tls-verify \
                        --insecure \
                        --docker-config=/kaniko/docker
                    '''
                }
            }
        }

        stage('Update GitOps repo') {
            agent {
                label 'docker-build'
            }
            steps {
                container('kaniko') {
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'gitops-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )]) {
                        sh '''
                        git config --global user.email "ci@tuanhuu3264.com"
                        git config --global user.name "CI Bot"
                        export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o StrictHostKeyChecking=no"

                        git clone $GITOPS_REPO
                        cd devops_k8s/k8s

                        sed -i "s|image: .*|image: ${IMAGE}|g" deployment.yaml
                        git commit -am "Update image to ${IMAGE}"
                        git push origin main
                        '''
                    }
                }
            }
        }
    }
}
