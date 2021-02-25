	<?php
	use face\FaceDetector;
	header("Access-Control-Allow-Origin: *");
	
	$response = array();
	if($_SERVER["REQUEST_METHOD"] == "POST")
	{
		ini_set('memory_limit', '256M');
		// Check if file was uploaded without errors
		if(isset($_FILES["photo"]) && $_FILES["photo"]["error"] == 0)
		{
			$allowed = array("jpg" => "image/jpg", "jpeg" => "image/jpeg");
			$filename = $_FILES["photo"]["name"];
			$filetype = $_FILES["photo"]["type"];
			$filesize = $_FILES["photo"]["size"];
			$id = $_POST['id'];
			$postEventID = $_POST['eventID'];
			$facePer_start = 0 ;
			$facePer_end = 0 ;
			$brightness_start = 0 ;
			$brightness_end = 0 ;
			$status_selected = 0 ;
			
			

			// Verify file extension
			$ext = pathinfo($filename, PATHINFO_EXTENSION);
			if(!array_key_exists($ext, $allowed)) die("Error: Please select a valid file format.");

			// Verify file size - 5MB maximum
			$maxsize = 10 * 1024 * 1024;
			if($filesize > $maxsize) die("Error: File size is larger than the allowed limit.");

			// Verify MYME type of the file
			if(in_array($filetype, $allowed)){
				// Check whether file exists before uploading it
				if(file_exists("upload/" . $_FILES["photo"]["name"])){
					echo $_FILES["photo"]["name"] . " is already exists.";
				} else{
					move_uploaded_file($_FILES["photo"]["tmp_name"], "upload/" . $_FILES["photo"]["name"]);
					$response['message'] = 'Your file was uploaded successfully.';
					$response['error'] = false;
				}
			} else{
				echo "Error: There was a problem uploading your file. Please try again.";
			}
		} 
		else
		{
			echo "Error: " . $_FILES["photo"]["error"];
		}
		
		
		include 'src/Cloudinary.php';
		include 'src/Uploader.php';
		if (file_exists('settings.php')) 
		{
			include 'settings.php';
		}
		
		$sample_paths = array("images" => getcwd(). DIRECTORY_SEPARATOR .'upload/'.$_FILES["photo"]["name"]);
		
		
		$default_upload_options = array("tags" => "basic_sample");
		$eager_params = array("width" => 200, "height" => 150, "crop" => "scale");
		$files = array();
		
		# This function, when called uploads all files into your Cloudinary storage and saves the
		# metadata to the $files array.
		function do_uploads(){
			global $files, $sample_paths, $default_upload_options, $eager_params;

			# public_id will be generated on Cloudinary's backend.
			$files = \Cloudinary\Uploader::upload($sample_paths["images"],
				$default_upload_options);
			
			return $files;

		}
		
		
		function getBrightness($gdHandle) {
			$width = imagesx($gdHandle);
			$height = imagesy($gdHandle);

			$totalBrightness = 0;

			for ($x = 0; $x < $width; $x++) {
				for ($y = 0; $y < $height; $y++) {
					$rgb = imagecolorat($gdHandle, $x, $y);

					$red = ($rgb >> 16) & 0xFF;
					$green = ($rgb >> 8) & 0xFF;
					$blue = $rgb & 0xFF;

					$totalBrightness += (max($red, $green, $blue) + min($red, $green, $blue)) / 2;
				}
			}

			imagedestroy($gdHandle);

			return ($totalBrightness / ($width * $height)) / 2.55;
		}
		
		$tempvar = do_uploads();
		include "FaceDetector.php";

		$detector = new FaceDetector('detection.dat');
		$detector->faceDetect("upload/".$_FILES["photo"]["name"]);
		//$detector->cropFaceToJpeg();

		$list = list($width, $height, $type, $attr) = getimagesize("upload/".$_FILES["photo"]["name"]);
		$var = $detector->cropFaceToJpeg();

		$temparray =array();
		$temparray['owidth'] = $list[0];
		$temparray['oheight'] = $list[1];
		$temparray['fwidth'] = $var;
		$temparray['fheight'] = $var;
		$temparray['Brightness'] =  round (getBrightness( imagecreatefromjpeg('upload/'.$_FILES["photo"]["name"])) );
		$temparray['cloudnary-image-URL'] = $tempvar['url'];
		$response['message'] = 'New Photo';
		$response['error'] = false;

		$facePer = round ((($temparray['fwidth']*$temparray['fheight'])/($temparray['owidth']*$temparray['oheight'])*100));
		
		unlink('upload/'.$_FILES["photo"]["name"]);

		// store link in database
		include '../config.php';
		$sql = "INSERT INTO selfie_gallery (event_id, user_id, image_brightness, image_url, image_facePercent)
			VALUES (".$postEventID.",".$_POST['id'].", ".$temparray['Brightness'].", '".$temparray['cloudnary-image-URL']."', ".$facePer.")";

			if ($base->query($sql) === TRUE) 
			{
				$response['message'] = 'New record created successfully';
				$response['error'] = false;
			} 
			else 
			{
				$response['message'] =  $base->error;
			}

		$base->close();
	}


	echo json_encode($response);

	?>
