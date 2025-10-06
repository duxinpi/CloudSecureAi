package app.xdu.com.androidassessment.UI;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import app.xdu.com.androidassessment.ViewData.UserInfo;
import app.xdu.com.androidassessment.ViewData.VideoDetailInfo;
import app.xdu.com.androidassessment.data.Channel;
import app.xdu.com.androidassessment.data.User;
import app.xdu.com.androidassessment.data.UserDataCache;
import app.xdu.com.androidassessment.data.UserVideos;
import app.xdu.com.androidassessment.data.VideoDetail;

public class PresenterHelper {



    public void parseUserData(String result) {

        try {

            JSONObject jsonObject = new JSONObject(result);
            JSONObject userObject = jsonObject.getJSONObject("user");
            User user = new User(userObject.getInt("id"),
                    userObject.getString("name"), userObject.getString("username"));

            JSONArray videosObject = jsonObject.getJSONArray("videos");
            List<UserVideos> userVideos = new ArrayList<>();
            for (int i = 0; i < videosObject.length(); i++) {
                JSONObject eachVideo = videosObject.getJSONObject(i);
                JSONObject channelObject = eachVideo.getJSONObject("channel");

                Channel channel = new Channel(channelObject.getString("name"),
                        channelObject.getString("profileImageUrl"), channelObject.getInt("numberOfSubscribers"));

                Bitmap videoImage = getBitmapFromURL(eachVideo.getString("imageUrl"));
                Bitmap profileImage = getBitmapFromURL(channel.getProfileImageUrl());
                UserInfo userInfo = new UserInfo(videoImage, profileImage, eachVideo.getString("name"), eachVideo.getInt("numberOfViews"), eachVideo.getInt("id"));

                UserVideos v = new UserVideos(eachVideo.getInt("id"),
                        eachVideo.getString("name"),
                        eachVideo.getString("link"),
                        eachVideo.getString("imageUrl"),
                        eachVideo.getInt("numberOfViews"),
                        channel,
                        userInfo);
                userVideos.add(v);
            }
            UserDataCache.INSTANCE.getUserData().initData(user, userVideos);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void parseVideoData(String result){
        try {
            if (result.length()<=2) {
                return ;
            }
            JSONArray jsonArray = new JSONArray(result);
            List<VideoDetail> detailList = new ArrayList<>();
            for (int i =0; i < jsonArray.length();  i++) {
                JSONObject jsonObjectEach = jsonArray.getJSONObject(i);
                VideoDetail detail = new VideoDetail(jsonObjectEach.getString("name"),
                        jsonObjectEach.getString("duration"),
                        jsonObjectEach.getInt("number"),
                        jsonObjectEach.getString("imageUrl"),
                        jsonObjectEach.getString("link"),
                        null);
                VideoDetailInfo videoDetailInfo = new VideoDetailInfo(getBitmapFromURL(detail.getImageUrl()),
                        detail.getName(),
                        detail.getDuration());
                detail.setVideoDetailInfo(videoDetailInfo);
                detailList.add(detail);
            }
            UserDataCache.INSTANCE.getUserData().initDetails(detailList);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }


    private Bitmap getBitmapFromURL(String src) {
        try {
            URL url = new URL(src);
            HttpURLConnection connection = (HttpURLConnection) url
                    .openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            Bitmap myBitmap = BitmapFactory.decodeStream(input);
            return myBitmap;
        } catch (IOException e) {
            Log.e("xdu", "Retrieve Bitmap Failed", e);
            return null;
        }
    }

    /**
     * Saves a BufferedImage to a file in BMP format.
     *
     * @param image the BufferedImage to save
     * @param filePath the path where the BMP file should be stored
     * @return true if saved successfully, false otherwise
     */
    public static boolean saveAsBitmap(BufferedImage image, String filePath) {
        try {
            File outputFile = new File(filePath);
            return ImageIO.write(image, "bmp", outputFile);
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }



}
