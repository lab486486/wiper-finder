#!/bin/zsh
# Bubblewrap / TWA 빌드용 환경 변수
export ANDROID_HOME="$HOME/Library/Android/sdk"

# Bubblewrap requires JDK 17 (Android Studio JBR is often newer)
_bubblewrap_jdk="$HOME/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home"
if [[ -f "$_bubblewrap_jdk/release" ]]; then
  export JAVA_HOME="$_bubblewrap_jdk"
else
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi
unset _bubblewrap_jdk

export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# Keystore passwords (created by twa-bootstrap.mjs)
if [[ -f "${0:a:h}/../twa/.keystore-env" ]]; then
  set -a
  source "${0:a:h}/../twa/.keystore-env"
  set +a
fi

echo "JAVA_HOME=$JAVA_HOME"
echo "ANDROID_HOME=$ANDROID_HOME"
java -version 2>&1 | head -1
