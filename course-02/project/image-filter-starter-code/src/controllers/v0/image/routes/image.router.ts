
import { Router, Request, Response } from 'express';
import {filterImageFromURL, deleteLocalFiles} from '../../../../util/util';
import fs from 'fs';

const router: Router = Router();

// GET /filteredimage?image_url={{URL}}
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. deletes any files on the server on finish of the response
  //    4. send the resulting file in the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
router.get('/filteredimage', async (req: Request, res: Response) => 
{
    await filterCoordinator(req, res)
    .catch(err => res.status(500).send(err));
});

async function filterCoordinator(req: Request, res: Response)
{

    // 1. validate image_url
    if (typeof req.query.image_url === 'undefined' || req.query.image_url.trim() == false)
    {
        res.status(400).send("query parameter (image_url) not defined.");

        return;
    }

    // 2a. Manipulate image
    var localFilePath = await filterImageFromURL(req.query.image_url);

    // 2b. Read in manipulated file and write to response.
    try
    {
        fs.readFile(localFilePath, function(err, data) {

            if(err)
            {
                throw (err);
            }
    
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.write(data);
            res.end();
          });
    }
    catch(err)
    {
        res.status(500).send("Unable to read from file system.");
    }

    // 3. Delete file
    const files = new Array();
    files.push(localFilePath);

    await deleteLocalFiles(files);
}


export const ImageRouter: Router = router;