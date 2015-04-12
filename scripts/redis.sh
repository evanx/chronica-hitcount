
 
  for key in `redis-cli keys 'hitcount:*'`
  do
    echo redis-cli hgetall "$key"
    redis-cli hgetall "$key"
  done

