# Segment and joint names
![skeleton names](images/skeleton.jpg)
## Skeleton description

| Number          | Segment                               | Proximal Joint                                             | Distal Joint |
| :-----------    | :---------                            | :------------                                              | :------------  | 
| 1               | Hips                                  | Null                                                       | Null |
| 2               | Spine                                 | HipsSpine                                                  | SpineSpine1 |
| 3               | Spine1                                | SpineSpine1                                                | SpineSpine2 |
| 4               | Spine2                                | Spine1Spine2                                               | Spine2Neck |
| 5               | Neck                                  | Spine2Neck                                                 | NeckHead |
| 6               | Head                                  | NeckHead                                                   | HeadContact* |
| 7<br>12         | LeftShoulder<br>RightShoulder         | LeftSternoclavicular<br>RightSternoclavicular              | LeftGlenohumeral<br>RightGlenohumeral |
| 8<br>13         | LeftArm<br>RightArm                   | LeftGlenohumeral<br>RightGlenohumeral                      | LeftElbow<br>RightElbow |
| 9<br>14         | LeftForeArm<br>RightForeArm           | LeftElbow<br>RightElbow                                    | LeftForeArmLeftForeArmRoll<br>RightForeArmRightForeArmRoll |
| 10<br>15        | LeftForeArmRoll<br>RightForeArmRoll   | LeftForeArmLeftForeArmRoll<br>RightForeArmRightForeArmRoll | LeftWrist<br>RightWrist |
| 11<br>16        | LeftHand<br>RightHand                 | LeftWrist<br>RightWrist                                    | LeftHandContact*<br>RightHandContact* |
| 17<br>21        | LeftUpLeg<br>RightUpLeg               | LeftHip<br>RightHip                                        | LeftHip<br>RightHip |
| 18<br>22        | LeftLeg<br>RightLeg                   | LeftKnee<br>RightKnee                                      | LeftKnee<br>RightKnee |
| 19<br>23        | LeftFoot**<br>RightFoot**             | LeftAnkle<br>RightAnkle                                    | LeftFootContact*<br>RightFootContact* |
| 20<br>24        | LeftToeBase**<br>RightToeBase**       | Null                                                       | Null |

\* These are virtual joints where the external forces and moments will be applied to one or more segment extremities. It is used during the inverse dynamics procedure. For example in gait, this Contact joint is the center of pressure where the foot is in contact with the force plate. It is useful if one wants to access the force plate data such as center of pressure, force and free moment.  
\** Note that the LeftFoot/RightFoot is the extremity segment instead of the LeftToeBase/RightToeBase for the lower body. LeftToeBase/RightToeBase has only a visual purpose with no biomechanical meaning.
