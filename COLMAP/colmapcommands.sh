
# creates jpegs dir and converts jpeg files to jpg in jpeg folder, resizing to 1/4 the size
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

# path to colmap command line executable
alias colmap='/Applications/COLMAP.app/Contents/MacOS/colmap'



# Remove troublesome characters from file names
removespacesfromfilenames(){
  for f in *; do mv "$f" `echo $f | sed 's/[[:space:]]/__/g'`; done
  for f in *; do mv "$f" `echo $f | tr ':' '_'`; done
}

prepforcolmap_quarter(){
  removespacesfromfilenames
  mkdir jpegs
  for i in *.jpeg;
    do name=`echo "$i" | cut -d'.' -f1`
    echo "$name"
    ffmpeg -i "$i" -vf scale="iw/4:ih/4" "jpegs/${name}.jpg"
  done
}

prepforcolmap_png(){
  removespacesfromfilenames
  createjpegs
}


prepdirforcolmap(){
  removespacesfromfilenames
  mkdir images
  for i in *.jpeg;
    do name=`echo "$i" | cut -d'.' -f1`
    echo "$name"
    ffmpeg -i "$i" -vf scale="iw/$1:ih/$1" "images/${name}.jpg"
  done
}

# example of how to do automated reconstruction in colmap from command line
# https://colmap.github.io/cli.html
reconstructwithcolmap(){
  colmap automatic_reconstructor \
    --workspace_path $1\
    --image_path $2
}
