   M S B A M L   `   `   `  ����F  BHTTPMonitor, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null;"clr-namespace:HTTPMonitor.ControlsHTTPMonitor.Controls  5      (    "HTTPMonitor.Controls.ServerControl   5      W SPresentationCore, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35F 9http://schemas.microsoft.com/winfx/2006/xaml/presentation     5      R NSystem.Xaml, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5      Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5      @d2http://schemas.microsoft.com/expression/blend/2008     5      4local"clr-namespace:HTTPMonitor.Controls     5      .��5	      �   � RowDefinitions  5
   
   �� 5      $
��Auto �6   �� 5      $��* �6   �� 5      $
��Auto �6   .+�5   
   � $��0��6   $��10q�6    � ColumnDefinitions 5      �� 5      $
��Auto �6#   �� 5      $��* �6#   �� 5      $
��Auto �6#   .+�5      �� $��0��6   $��Port:��6(   $��Center=�65   $��0,0,10,0q�6P   �� 5      -   5         ��Name$ PortTextBox��5      $��1��6+   $
��8080��6;   $��0,0,10,0q�6G   $��Center=�6Y   �� 5      -   5         ��Name$ ToggleServerButton��5      $��2��61   $��Start Server��6A   $	��100��6y   5      �� 5   
   $��1��6   $��Server Logs��6    $��10q�65   .��5      �� -   5        $ LogsTextBox��5       �� 
IsReadOnly$
 True��6+    �� TextWrapping$
 Wrap=�6=   " �� VerticalScrollBarVisibility$
 Auto=�6Q   5       �� 5#   
   $��2��6   $��25��6!   .@�5$      �� -   5         ��Name$ ServerStatusTextBlock��5$      $��Server: Stopped��67   5%      5&      5'      