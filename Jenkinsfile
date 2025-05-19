pipeline {
  agent {
    kubernetes {
      label 'kaniko' // trùng label bạn đặt trong PodTemplate
      defaultContainer 'kaniko' // mặc định container là kaniko
    }
  }

  environment {
    IMAGE_TAG = "latest"
    IMAGE = "tuanhuu3264/api-test-k8s:${IMAGE_TAG}"
    GITOPS_REPO = "git@github.com:tuanhuu3264/devops_k8s.git"
  }

  stages {
    stage('Checkout App') {
      steps {
        container('kaniko') {
          git branch: 'main', url: 'https://github.com/tuanhuu3264/api-test.git'
        }
      }
    }

    stage('Build & Push with Kaniko') {
      steps {
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
