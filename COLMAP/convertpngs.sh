createjpegs_smaller(){
mkdir jpegs
for i in *.jpeg;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" -vf scale="iw/4:ih/4" "jpegs/${name}.jpg"
done
}

createjpegs_half(){
mkdir jpegs
for i in *.jpeg;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" -vf scale="iw/2:ih/2" "jpegs/${name}.jpg"
done
}

createjpegs(){
mkdir jpegs
for i in *.png;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" "jpegs/${name}.jpg"
done
}


removespaces(){
  for f in *; do mv "$f" `echo $f | tr ' ' '_'`; done
}
