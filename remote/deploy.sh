#!/usr/bin/env bash

set -e
set -o pipefail

user=bot
server=sydney.floatplane.dev
domain=reddust.org.au

echo "----------"
echo "Deploying:"
echo $domain
echo $user@$server
echo "----------"

(
  set -x
  scp -i ~/.ssh/$user@$server remote/deploy-remote.sh $user@$server:~/
  ssh -i ~/.ssh/$user@$server $user@$server "~/deploy-remote.sh $domain; rm -f ~/deploy-remote.sh"
)
