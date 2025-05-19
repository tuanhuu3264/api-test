pipeline {
  agent { label 'kubeagent' }

  environment {
    IMAGE_TAG = "latest"
    IMAGE = "tuanhuu3264/api-test-k8s:${IMAGE_TAG}"
  }

  stages {
    stage('Checkout App') {
      steps {
        git branch: 'main', url: 'https://github.com/tuanhuu3264/api-test.git'
      }
    }

    stage('Build & Push with Kaniko') {
      steps {
        container('kaniko') {
          sh '''
          /kaniko/executor \
            --dockerfile=./api/Dockerfile \
            --context=./ \
            --destination=$IMAGE
          '''
        }
      }
    }

    stage('Update GitOps repo') {
      steps {
        container('alpine') {
          withCredentials([sshUserPrivateKey(
              credentialsId: 'gitops-ssh-key',  // ✅ ID bạn đã tạo trong Jenkins
              keyFileVariable: 'SSH_KEY'
          )]) {
            sh '''
            git config --global user.email "ci@tuanhuu3264.com"
            git config --global user.name "CI Bot"
            export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o StrictHostKeyChecking=no"

            git clone $GITOPS_REPO
            cd devops_k8s/environments/dev

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