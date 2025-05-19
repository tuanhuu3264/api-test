pipeline {
  agent { label 'kubeagent' }

  environment {
    IMAGE_TAG = "${BUILD_NUMBER}"
    IMAGE = "yourdockerhubuser/my-node-app:${IMAGE_TAG}"
    GITOPS_REPO = "git@github.com:your-org/gitops-repo.git"
  }

  stages {
    stage('Checkout App') {
      steps {
        git branch: 'main', url: 'https://github.com/your-org/nodejs-app.git'
      }
    }

    stage('Build & Push with Kaniko') {
      steps {
        container('kaniko') {
          sh '''
          /kaniko/executor \
            --dockerfile=`pwd`/Dockerfile \
            --context=`pwd` \
            --destination=$IMAGE
          '''
        }
      }
    }

    stage('Update GitOps repo') {
      steps {
        container('alpine') {
          sh '''
          git config --global user.email "ci@yourorg.com"
          git config --global user.name "CI Bot"

          git clone $GITOPS_REPO
          cd gitops-repo/environments/dev
          sed -i "s|image: .*|image: $IMAGE|g" deployment.yaml
          git commit -am "Update image to $IMAGE"
          git push origin main
          '''
        }
      }
    }
  }
}