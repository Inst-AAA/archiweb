package main;

import com.google.gson.Gson;
import converter.WB_Converter;
import geometry.Plane;
import geometry.Vertices;
import io.socket.client.IO;
import io.socket.client.Socket;

import java.net.URISyntaxException;

/**
 * @classname: archiweb
 * @description:
 * @author: amomorning
 * @date: 2020/12/31
 */
public class Server {
    private static final int PORT = 27781;
    private Socket socket;
    public Generator generator;


    public Server(String... args) {
        try {
            if (args.length > 0) {
                socket = IO.socket(args[0]);
                this.setup();
                System.out.println("Socket connected to " + args[0]);
            } else {
                String uri = "http://localhost:" + PORT;
                socket = IO.socket(uri);
                this.setup();
                System.out.println("Socket connected to " + uri);
            }

        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }


    public void setup() {

        generator = new Generator();
        Gson gson = new Gson();

        socket.connect();

        socket.on("bts:exampleReceiveGeometry", args -> {
            // receive
            try {
                ArchiJSON archijson = gson.fromJson(args[0].toString(), ArchiJSON.class);
                archijson.parseGeometryElements(gson);

                // processing
                generator.pts = WB_Converter.toWB_Point((Vertices) archijson.getGeometries().get(0));
                generator.plane = WB_Converter.toWB_Polygon((Plane) archijson.getGeometries().get(1));
                generator.calcVoronoi(archijson.getProperties().getD());

                // return
                ArchiJSON ret = generator.toArchiJSON(archijson.getId(), gson);
                socket.emit("stb:sendGeometry", gson.toJson(ret));
            } catch (Exception e) {
                System.out.println(e);
            }

        });
    }




}
