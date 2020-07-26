#!/usr/bin/env bash

set -e
set -o pipefail

echo "----------"
echo "Preparing SSH:"
echo "PRIVATE_KEY: $PRIVATE_KEY"
echo "PUBLIC_KEY: $PUBLIC_KEY"
echo "SSH_CONFIG: $SSH_CONFIG"
echo "----------"
(set -x; mkdir ~/.ssh)
echo "----------"
(set -x; chmod -R 0700 ~/.ssh)
echo "----------"
(set -x; ssh-keyscan -H singapore.server.floatplane.dev > ~/.ssh/known_hosts)
echo "----------"

# echo "$PRIVATE_KEY" > ~/.ssh/id_rsa
# echo "$PUBLIC_KEY" > ~/.ssh/id_rsa.pub
# echo "$SSH_CONFIG" > ~/.ssh/config
# chmod 600 ~/.ssh/id_rsa
# chmod 600 ~/.ssh/id_rsa.pub
# chmod 600 ~/.ssh/config

# echo "----------"
